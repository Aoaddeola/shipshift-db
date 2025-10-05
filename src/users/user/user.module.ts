import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { OAuthProvider } from '../../auth/oauth/oauth-provider.entity.js';
import { User } from './user.model.js';
import { EmailModule } from '../../notification/email.module.js';

@Module({
  imports: [SequelizeModule.forFeature([User, OAuthProvider]), EmailModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
