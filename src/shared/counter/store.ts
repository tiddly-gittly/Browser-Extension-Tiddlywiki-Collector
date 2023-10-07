import { localStorage } from 'redux-persist-webextension-storage';
import { wrapStore } from 'webext-zustand';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface CounterState {
  count: number;
  decrement: () => void;
  increment: () => void;
  incrementAsync: (amount: number) => Promise<void>;
  incrementByAmount: (amount: number) => void;
  incrementIfOdd: (amount: number) => void;
}

export const useCounterStore = create<CounterState>()(
  persist(
    (set, get) => ({
      count: 0,
      increment: () => {
        set((state) => ({ count: state.count + 1 }));
      },
      decrement: () => {
        set((state) => ({ count: state.count - 1 }));
      },
      incrementByAmount: (amount) => {
        set((state) => ({ count: state.count + amount }));
      },
      incrementAsync: async (_amount) => {
        const fetchAmount = async () =>
          await new Promise<{ data: number }>((resolve) =>
            setTimeout(() => {
              resolve({ data: _amount });
            }, 500)
          );

        const { data: amount } = await fetchAmount();

        set((state) => ({ count: state.count + amount }));
      },
      incrementIfOdd: (amount) => {
        const { count, incrementByAmount } = get();
        if (count % 2 === 1) {
          incrementByAmount(amount);
        }
      },
    }),
    {
      name: 'root',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const counterStoreReadyPromise = wrapStore(useCounterStore);

export default useCounterStore;
