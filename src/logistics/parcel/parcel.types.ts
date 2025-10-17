import { User } from '../../users/user/user.types.js';
import { Currency } from '../../common/currency/currency.types.js';

/**
 * Currency ID Type
 */
export type CurrencyId = string;

/**
 * Parcel Handling Info Interface
 */
export interface ParcelHandlingInfo {
  sealed: boolean;
  fragile: boolean;
  perishable: boolean;
  weight?: number;
  size?: number;
}

/**
 * Parcel Interface
 */
export interface Parcel {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  quantity: number;
  value: [CurrencyId, number];
  image?: string;
  handlingInfo: ParcelHandlingInfo;
  currency?: Currency;
  owner?: User;
  createdAt?: string;
  updatedAt?: string;
}
