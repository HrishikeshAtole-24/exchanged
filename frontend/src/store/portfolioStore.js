import { create } from 'zustand';
import { portfolioService } from '@/services/portfolio.service';

const usePortfolioStore = create((set, get) => ({
  holdings: [],
  loading: false,
  error: null,

  fetchPortfolio: async () => {
    try {
      set({ loading: true, error: null });
      const res = await portfolioService.getPortfolio();
      set({ holdings: res.data || [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addCoin: async (coinId, amount, buyPrice) => {
    const res = await portfolioService.addCoin(coinId, amount, buyPrice);
    await get().fetchPortfolio();
    return res.data;
  },

  updateEntry: async (id, amount, buyPrice) => {
    const res = await portfolioService.updateEntry(id, amount, buyPrice);
    await get().fetchPortfolio();
    return res.data;
  },

  removeEntry: async (id) => {
    await portfolioService.removeEntry(id);
    set({ holdings: get().holdings.filter((h) => h.id !== id) });
  },
}));

export default usePortfolioStore;
