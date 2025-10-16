import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CoinState {
  balance: number;
  charityCoins: number;
  transactions: Transaction[];
  setBalance: (balance: number) => void;
  setCharityCoins: (coins: number) => void;
  addTransaction: (transaction: Transaction) => void;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'purchase' | 'donation' | 'reward';
  createdAt: string;
}

export const useCoinStore = create<CoinState>()(
  persist(
    (set, get) => ({
      balance: 0,
      charityCoins: 0,
      transactions: [],
      setBalance: (balance) => set({ balance }),
      setCharityCoins: (charityCoins) => set({ charityCoins }),
      addTransaction: (transaction) => 
        set({ transactions: [transaction, ...get().transactions.slice(0, 49)] }),
    }),
    {
      name: 'coin-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);