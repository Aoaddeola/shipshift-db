// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigService } from '../../config/config.service.js';
import { ThirdPartyAuthController } from './oauth.controller.js';
import { ThirdPartyAuthService } from './oauth.service.js';
import { UserModule } from '../../users/user/user.module.js';

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
  controllers: [ThirdPartyAuthController],
  providers: [ThirdPartyAuthService],
  exports: [ThirdPartyAuthService],
})
export class OAuthModule {}
