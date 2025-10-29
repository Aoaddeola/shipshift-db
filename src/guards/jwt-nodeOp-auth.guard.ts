// src/guards/jwt-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AppConfigService } from '../config/config.service.js';
import { UserType } from '../users/user/user.types.js';
import { ColonyNodeService } from '../onchain/colony-node/colony-node.service.js';

@Injectable()
export class JwtNodeOpAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private colonyNodeService: ColonyNodeService,
    private configService: AppConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.jwtAccessSecret,
      });
      request.user = payload;
      if (
        (await this.colonyNodeService.getColonyNodesByOperatorAddress(
          payload.walletAddress,
        )) === null ||
        payload.userType !== UserType.NODE_OPERATOR
      ) {
        throw new Error();
      }
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
