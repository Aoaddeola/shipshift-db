import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BankAccountService } from './bank-account.service.js';
import { BankAccountModel } from './bank-account.model.js';
import { BankAccount } from './bank-account.types.js';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard.js';
import { JwtNodeOpAuthGuard } from '../../guards/jwt-nodeOp-auth.guard.js';

@Controller('bank-accounts')
export class BankAccountController {
  constructor(private readonly bankAccountService: BankAccountService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body()
    bankAccount: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<BankAccountModel> {
    return this.bankAccountService.create(bankAccount);
  }

  @Get()
  @UseGuards(JwtNodeOpAuthGuard)
  async findAll(): Promise<BankAccountModel[]> {
    return this.bankAccountService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BankAccountModel | null> {
    return this.bankAccountService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('owner/:ownerId')
  async findByOwner(
    @Param('ownerId') ownerId: string,
  ): Promise<BankAccountModel[] | null> {
    return this.bankAccountService.findByOwner(ownerId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() bankAccount: Partial<BankAccount>,
    @Req() request,
  ): Promise<BankAccountModel> {
    if (request.user.sub !== bankAccount.ownerId) {
      throw new ForbiddenException(
        'You are not authorized to make modifications',
      );
    }
    return this.bankAccountService.update(id, bankAccount);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.bankAccountService.remove(id);
  }
}
