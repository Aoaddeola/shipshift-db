import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BankAccountModel } from './bank-account.model.js';
import { BankAccount } from './bank-account.types.js';

@Injectable()
export class BankAccountService {
  private logger = new Logger(BankAccountService.name);
  constructor(
    @InjectModel(BankAccountModel)
    private bankAccountModel: typeof BankAccountModel,
  ) {}

  async create(
    bankAccount: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<BankAccountModel> {
    this.logger.debug('Creating bank account', bankAccount);
    return this.bankAccountModel.create(bankAccount);
  }

  async findAll(): Promise<BankAccountModel[]> {
    return this.bankAccountModel.findAll();
  }

  async findOne(id: string): Promise<BankAccountModel | null> {
    const bankAccount = await this.bankAccountModel.findByPk(id);
    // if (!bankAccount) {
    //   throw new NotFoundException(`Bank account with ID ${id} not found`);
    // }
    return bankAccount || null;
  }

  async findByOwner(ownerId: string): Promise<BankAccountModel[] | null> {
    const bankAccounts = await this.bankAccountModel.findAll({
      where: { ownerId },
    });
    return bankAccounts;
  }

  async update(
    id: string,
    bankAccount: Partial<BankAccount>,
  ): Promise<BankAccountModel> {
    // First, check if record exists
    const existing = await this.bankAccountModel.findByPk(id);
    if (!existing) {
      throw new NotFoundException(`Bank account with ID ${id} not found`);
    }

    // Perform update
    await this.bankAccountModel.update(bankAccount, {
      where: { id },
    });

    // Fetch updated record
    const updated = await this.bankAccountModel.findByPk(id);
    if (!updated) {
      throw new NotFoundException(`Bank account with ID ${id} not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    if (record) {
      await record.destroy();
    }
  }

  async removeByOwner(ownerId: string): Promise<void> {
    const records = await this.findByOwner(ownerId);

    if (!records) {
      throw new NotFoundException(
        `No bank accounts found for owner ${ownerId}`,
      );
    }

    if (records.length > 0) {
      await Promise.all(
        records.map(async (record) => {
          this.logger.log('Deleting bank account: ' + record.id);
          await record.destroy();
        }),
      );
    }
  }
}
