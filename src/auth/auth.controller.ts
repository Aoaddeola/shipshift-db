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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    return { token: await this.authService.generateToken(address) };
  }
}
