/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service.js';
import { User } from './user.model.js';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.userService.create(user);
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

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

  @Put(':id')
  async update(@Param('id') id: string, @Body() user: Partial<User>) {
    return this.userService.update(id, user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
    return { deleted: true, id };
  }
}
