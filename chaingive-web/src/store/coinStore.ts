import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Transaction {
  id: string;
  amount: number;
  type: 'earn' | 'spend';
  description: string;
  createdAt: string;
}

interface CoinStore {
  balance: number;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateBalance: (amount: number) => void;
  reset: () => void;
}

export const useCoinStore = create<CoinStore>()(
  persist(
    (set, get) => ({
      balance: 0,
      transactions: [],
      
      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
          balance: transaction.type === 'earn' 
            ? state.balance + transaction.amount 
            : state.balance - transaction.amount,
        }));
      },
      
      updateBalance: (amount) => set({ balance: amount }),
      
      reset: () => set({ balance: 0, transactions: [] }),
    }),
    {
      name: 'coin-store',
    }
  )
);