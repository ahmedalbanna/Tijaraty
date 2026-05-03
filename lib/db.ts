import Dexie, { type Table } from 'dexie';

export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  isLoyaltyEligible: boolean;
}

export interface CartItem extends Product {
  cartQuantity: number;
}

export class TijaratyDB extends Dexie {
  products!: Table<Product, string>;

  constructor() {
    super('TijaratyDB');
    this.version(1).stores({
      products: 'id, name, barcode, category'
    });
  }
}

export const db = new TijaratyDB();
