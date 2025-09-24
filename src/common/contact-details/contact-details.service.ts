import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Database } from '../../orbitdb/database.js';
import { InjectDatabase } from '../../orbitdb/inject-database.decorator.js';
import { ContactDetails } from './contact-details.types.js';

@Injectable()
export class ContactDetailsService {
  private readonly logger = new Logger(ContactDetailsService.name);

  constructor(
    @InjectDatabase('contact-details')
    private database: Database<ContactDetails>,
  ) {}

  async createContactDetails(
    contact: Omit<ContactDetails, 'id'>,
  ): Promise<ContactDetails> {
    const id = randomUUID();
    this.logger.log(`Creating contact details: ${id}`);
    await this.database.put({ ...contact, id });
    return { id, ...contact };
  }

  async getContactDetails(id: string): Promise<ContactDetails> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Contact details not found');
    }
    return entry;
  }

  async getContactDetailsForOwner(ownerId: string): Promise<ContactDetails[]> {
    const all = await this.database.all();
    return all.filter((contact) => contact.ownerId === ownerId);
  }

  async deleteContactDetails(id: string): Promise<{ message: string }> {
    await this.getContactDetails(id);
    await this.database.del(id);
    return {
      message: `Contact details for \${contact.email} deleted successfully`,
    };
  }
}
