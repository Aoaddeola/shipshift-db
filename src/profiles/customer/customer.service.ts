import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../../orbitdb/inject-database.decorator.js';
import { Customer } from './customer.types.js';
import { Database } from '../../orbitdb/database.js';
import { randomUUID } from 'node:crypto';
import { CustomerCreateDto } from './customer-create.dto.js';
import { CustomerUpdateDto } from './customer-update.dto.js';
import { ContactDetailsService } from '../../common/contact-details/contact-details.service.js';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    @InjectDatabase('customer') private database: Database<Customer>,
    @Inject(ContactDetailsService)
    private contactDetailsDatabase: ContactDetailsService,
  ) {}

  async createCustomer(
    customer: Omit<
      Customer,
      'id' | 'createdAt' | 'updatedAt' | 'contactDetails'
    >,
  ): Promise<Customer> {
    const id = randomUUID();
    const now = new Date().toISOString();

    this.logger.log(`Creating customer: ${id}`);

    const newCustomer: Customer = {
      id,
      createdAt: now,
      updatedAt: now,
      address: customer.address,
      contactDetailsId: customer.contactDetailsId,
    };

    await this.database.put(newCustomer);
    return newCustomer;
  }

  async getCustomer(id: string, include?: string[]): Promise<Customer> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Customer not found');
    }

    return this.populateRelations(entry, include);
  }

  async getCustomers(include?: string[]): Promise<Customer[]> {
    const all = await this.database.all();
    return Promise.all(
      all.map((customer) => this.populateRelations(customer, include)),
    );
  }

  async getCustomersByContactDetails(
    contactDetailsId: string,
    include?: string[],
  ): Promise<Customer[]> {
    const all = await this.database.all();
    const customers = all.filter(
      (customer) => customer.contactDetailsId === contactDetailsId,
    );

    return Promise.all(
      customers.map((customer) => this.populateRelations(customer, include)),
    );
  }

  private async populateRelations(
    customer: Customer,
    include?: string[],
  ): Promise<Customer> {
    // Clone the customer to avoid modifying the original
    const populatedCustomer = { ...customer };

    // Handle contactDetails population
    if (include?.includes('contactDetails')) {
      try {
        const contactDetails = await this.contactDetailsDatabase.findOne(
          customer.contactDetailsId,
        );
        if (contactDetails) {
          populatedCustomer.contactDetails = contactDetails;
        }
      } catch (error) {
        this.logger.warn(
          `Could not fetch contact details for ${customer.contactDetailsId}`,
          error,
        );
      }
    }
    return populatedCustomer;
  }

  async updateCustomer(
    id: string,
    customer: CustomerCreateDto,
  ): Promise<Customer> {
    // First check if customer exists
    await this.getCustomer(id);

    const now = new Date().toISOString();

    // Create updated customer with ID preserved
    const updatedCustomer: Customer = {
      id,
      createdAt: now,
      updatedAt: now,
      address: customer.address,
      contactDetailsId: customer.contactDetailsId,
    };

    this.logger.log(`Updating customer: ${id}`);
    await this.database.put(updatedCustomer);
    return updatedCustomer;
  }

  async partialUpdateCustomer(
    id: string,
    update: CustomerUpdateDto,
  ): Promise<Customer> {
    const existingCustomer = await this.getCustomer(id);
    const now = new Date().toISOString();

    // Handle nested address update
    let updatedAddress = existingCustomer.address;
    if (update.address) {
      updatedAddress = {
        ...existingCustomer.address,
        ...update.address,
      };
    }

    // Create updated customer by merging existing with update
    const updatedCustomer = {
      ...existingCustomer,
      ...update,
      address: updatedAddress,
      updatedAt: now,
    };

    this.logger.log(`Partially updating customer: ${id}`);
    await this.database.put(updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<{ message: string }> {
    const customer = await this.getCustomer(id);
    await this.database.del(id);
    return {
      message: `Customer with contact details ${customer.contactDetailsId} deleted successfully`,
    };
  }
}
