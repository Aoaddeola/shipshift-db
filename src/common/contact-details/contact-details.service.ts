/* eslint-disable @typescript-eslint/no-unsafe-return */
// src/addresses/services/addresses.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { randomUUID } from 'node:crypto';
import { ContactDetailsModel } from './contact-details.model.js';
import { ContactDetails } from './contact-details.types.js';

@Injectable()
export class ContactDetailsService {
  constructor(
    @InjectModel(ContactDetailsModel)
    private readonly contactDetailsModel: typeof ContactDetailsModel,
  ) {}

  async create(dto: ContactDetails): Promise<ContactDetailsModel> {
    const id = randomUUID();
    return this.contactDetailsModel.create({
      ...dto,
      id,
    });
  }

  async findAll(): Promise<ContactDetailsModel[]> {
    return this.contactDetailsModel.findAll();
  }

  async findOne(id: string): Promise<ContactDetailsModel | null> {
    return this.contactDetailsModel.findOne({
      where: { id },
    });
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    if (record) {
      await record.destroy();
    }
  }

  async update(dto: ContactDetails): Promise<[affectedCount: number]> {
    const id = dto.id;
    return this.contactDetailsModel.update(dto, { where: { id } });
  }
}
