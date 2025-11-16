import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  UseGuards,
  Patch,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service.js';
import { User } from './user.model.js';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard.js';
import { UserType } from './user.types.js';
import { JwtNodeOpAuthGuard } from '../../guards/jwt-nodeOp-auth.guard.js';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.userService.createWithEmail(
      user.email,
      user.password,
      user.name,
      user.userType,
    );
  }

  @UseGuards(JwtNodeOpAuthGuard)
  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.userService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`User with ID \${id} not found`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() user: Partial<User>) {
    if (
      user.userType === UserType.ADMIN ||
      user.userType === UserType.NODE_OPERATOR
    ) {
      throw new ForbiddenException('Cannot update userType');
    }
    return this.userService.update(id, user);
  }

  @UseGuards(JwtNodeOpAuthGuard)
  @Patch(':id')
  async updateUserType(@Param('id') id: string, @Body() user: Partial<User>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ..._user } = user;
    return this.userService.update(id, _user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
    return { deleted: true, id };
  }
}
