// src/auth/auth.controller.ts
// import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { DataSignature } from '@meshsdk/common';
import { OperatorService } from '../../users/operator/operator.service.js';
import { bech32 } from 'bech32';

@Controller('web3/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly operatorService: OperatorService,
  ) {}

  @Post('challenge')
  getChallenge(@Body('address') address: string) {
    const challenge = this.authService.generateChallenge(address);
    return { challenge };
  }

  @Post('login')
  async login(
    @Body('address') address: string,
    @Body('signature') signature: DataSignature,
  ) {
    const isValid = await this.authService.validateWallet(address, signature);
    if (!isValid) {
      throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
    }
    const operator = await this.operatorService.getOperatorByAddress(
      convertAddrToRaw(address),
    );
    return {
      accessToken: await this.authService.generateToken(operator),
      user: { ...operator, userType: 'operator' },
    };
  }
}

export const convertAddrToRaw = (addr: string) => {
  let converted: string = '';
  const isHexadecimal = (str: string): boolean => {
    const hexRegExp = /^[0-9a-fA-F]+$/;
    return hexRegExp.test(str);
  };
  try {
    converted = Buffer.from(
      bech32.fromWords(bech32.decode(addr, 1000).words),
    ).toString('hex');
  } catch (error) {
    if (isHexadecimal(addr) && addr.length == 128) {
      console.log('Address already converted to raw', error);
      converted = addr;
    } else {
      console.log('Error converting address to raw', error);
    }
  }
  return converted;
};
