/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ContactDetailsModel } from './contact-details.model.js';
import { ContactDetails } from './contact-details.types.js';

@Injectable()
export class ContactDetailsService {
  constructor(
    @InjectModel(ContactDetailsModel)
    private contactDetailsModel: typeof ContactDetailsModel,
  ) {}

  async create(
    contactDetails: Omit<ContactDetails, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ContactDetailsModel> {
    return this.contactDetailsModel.create(contactDetails);
  }

  async findAll(): Promise<ContactDetailsModel[]> {
    return this.contactDetailsModel.findAll();
  }

  async findOne(id: string): Promise<ContactDetailsModel> {
    const contactDetails = await this.contactDetailsModel.findByPk(id);
    if (!contactDetails) {
      throw new NotFoundException(`Contact details with ID ${id} not found`);
    }
    return contactDetails;
  }

  async findByOwner(ownerId: string): Promise<ContactDetailsModel[]> {
    const contactDetails = await this.contactDetailsModel.findAll({
      where: { ownerId },
    });

    if (contactDetails.length === 0) {
      throw new NotFoundException(
        `No contact details found for owner ${ownerId}`,
      );
    }

    return contactDetails;
  }

  async findBySession(session: string): Promise<ContactDetailsModel> {
    const contactDetails = await this.contactDetailsModel.findOne({
      where: { session },
    });

    if (!contactDetails) {
      throw new NotFoundException(
        `No contact details found for session ${session}`,
      );
    }

    return contactDetails;
  }

  async update(
    id: string,
    contactDetails: Partial<ContactDetails>,
  ): Promise<ContactDetailsModel> {
    const [affectedCount, [updatedContactDetails]] =
      await this.contactDetailsModel.update(contactDetails, {
        where: { id },
        returning: true,
      });

    if (affectedCount === 0) {
      throw new NotFoundException(`Contact details with ID ${id} not found`);
    }

    return updatedContactDetails;
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    if (record) {
      await record.destroy();
    }
  }
}
