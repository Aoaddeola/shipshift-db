import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { OAuthProvider } from '../../auth/oauth/oauth-provider.entity.js';
import { User } from './user.model.js';
import { JwtModule } from '@nestjs/jwt';
import { ColonyNodeModule } from '../../onchain/colony-node/colony-node.module.js';
import { EmailModule } from '../../notification/channels/email.module.js';

@Module({
  imports: [
    SequelizeModule.forFeature([User, OAuthProvider]),
    EmailModule,
    ColonyNodeModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'secret_key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
