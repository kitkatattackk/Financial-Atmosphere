export interface Card {
  id: string;
  name: string;
  gradient: string;
  scale: number;
  rotate: number;
  font: string;
  balance: number;
  cardNumber: string;
  expiryDate: string;
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
}

export const DEFAULT_CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Bills', 'Salary', 'Investment', 'Other'
];
