// src/auth/auth.controller.ts
// import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { DataSignature } from '@meshsdk/common';
import { OperatorService } from '../../users/operator/operator.service.js';
import { UserType } from '../../users/user/user.types.js';
import { ColonyNodeService } from '../../onchain/colony-node/colony-node.service.js';

@Controller('web3/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly operatorService: OperatorService,
    private readonly colonyNodeService: ColonyNodeService,
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
    const operator = await this.operatorService.getOperatorByAddress(address);
    return {
      accessToken: await this.authService.generateToken(operator),
      user: { ...operator, userType: UserType.OPERATOR.toString() },
    };
  }

  @Post('nodeOperator/login')
  async nodeOperatorLogin(
    @Body('address') address: string,
    @Body('signature') signature: DataSignature,
  ) {
    const isValid = await this.authService.validateWallet(address, signature);
    if (!isValid) {
      throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
    }
    const colonyNode =
      await this.colonyNodeService.getColonyNodesByOperatorAddress(address);
    const _colonyNode = colonyNode.find((v) =>
      v.nodeOperatorAddresses.includes(address),
    );

    if (!_colonyNode) {
      throw new UnauthorizedException(
        'No node is associated with the wallet address',
      );
    }

    return {
      accessToken: await this.authService.generateNodeOperatorToken(
        address,
        _colonyNode,
      ),
      user: {
        id: _colonyNode.id,
        userType: UserType.NODE_OPERATOR,
        walletAddress: address,
      },
    };
  }
}
