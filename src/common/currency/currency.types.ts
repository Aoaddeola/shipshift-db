export interface Currency {
  id: string;
  currencySymbol: string;
  tokenName: string;
  userFriendlyName: string;
  isStableCoin?: boolean;
}
