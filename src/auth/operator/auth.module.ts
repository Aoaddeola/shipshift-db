// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './jwt.strategy.js';
import { AuthController } from './auth.controller.js';
import { OperatorModule } from '../../users/operator/operator.module.js';
import { AppConfigService } from '../../config/config.service.js';
import { ColonyNodeModule } from '../../onchain/colony-node/colony-node.module.js';

@Module({
  imports: [
    PassportModule,
    OperatorModule,
    ColonyNodeModule,
    JwtModule.registerAsync({
      useFactory: (appConfigService: AppConfigService) => ({
        secret: appConfigService.jwtAccessSecret,
        signOptions: {
          expiresIn: appConfigService.jwtAccessExpiration,
        },
      }),
      inject: [AppConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
