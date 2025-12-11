// src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true, // false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'secret_key',
    });
  }

  async validate(payload: any) {
    return {
      sub: payload.sub,
      walletAddress: payload.walletAddress,
      userType: payload.userType,
    };
  }
}
