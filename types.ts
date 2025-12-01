import { Timestamp } from 'firebase/firestore';

export interface Customer {
  id: string;
  name: string;
  market: string;
  mobile: string;
  address: string;
  serialNumber: string;
  isActive: number;
}

export interface Battery {
  id: string;
  batteryNumber: string;
  status: 'Available' | 'Given' | 'Returned';
  color: string;
  market: string;
}

export interface Transaction {
  id: string;
  customerId: string;
  batteryNumber: string;
  market: string;
  dateGiven: Timestamp;
  dateReturned: Timestamp | null;
  status: 'Pending' | 'Returned';
}

export type Page = 'dashboard' | 'give-battery' | 'return-battery' | 'customers' | 'batteries' | 'reports' | 'settings';

export interface AppSettings {
  markets: string[];
}