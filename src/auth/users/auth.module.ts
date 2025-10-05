// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigService } from '../../config/config.service.js';
import { ThirdPartyAuthController } from '../oauth/oauth.controller.js';
import { ThirdPartyAuthService } from '../oauth/oauth.service.js';
import { AuthController } from './auth.controller.js';
import { UserAuthService } from './auth.service.js';
import { UserModule } from '../../users/user/user.module.js';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UserModule,
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
  controllers: [AuthController, ThirdPartyAuthController],
  providers: [
    UserAuthService,
    ThirdPartyAuthService,
    AppConfigService,
    ConfigService,
  ],
  exports: [UserAuthService, ThirdPartyAuthService],
})
export class UserAuthModule {}
