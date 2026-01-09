import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ContactDetailsModel } from './contact-details.model.js';
import { ContactDetails } from './contact-details.types.js';

@Injectable()
export class ContactDetailsService {
  private logger = new Logger(ContactDetailsService.name);
  constructor(
    @InjectModel(ContactDetailsModel)
    private contactDetailsModel: typeof ContactDetailsModel,
  ) {}

  async create(
    contactDetails: Omit<ContactDetails, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ContactDetailsModel> {
    this.logger.debug(contactDetails);
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
    // First, check if record exists
    const existing = await this.contactDetailsModel.findByPk(id);
    if (!existing) {
      throw new NotFoundException(`Contact details with ID ${id} not found`);
    }

    // Perform update
    await this.contactDetailsModel.update(contactDetails, {
      where: { id },
    });

    // Fetch updated record
    const updated = await this.contactDetailsModel.findByPk(id);
    if (!updated) {
      throw new NotFoundException(`Contact details with ID ${id} not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    if (record) {
      await record.destroy();
    }
  }

  async removeByOwner(id: string): Promise<void> {
    const records = await this.findByOwner(id);
    if (records.length > 0) {
      await Promise.all(
        records.map(async (record) => {
          this.logger.log('Deleting contact details: ' + record.id);
          await record.destroy();
        }),
      );
    }
  }
}
