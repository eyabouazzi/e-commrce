import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { useUserStore } from "./useUserStore";

const GUEST_WISHLIST_KEY = "guest_wishlist";

export const useWishlistStore = create((set, get) => ({
  wishlist: [],

  getWishlist: async () => {
    const { user } = useUserStore.getState();
    if (!user) {
      try {
        const stored = localStorage.getItem(GUEST_WISHLIST_KEY);
        const wishlist = stored ? JSON.parse(stored) : [];
        set({ wishlist });
      } catch (e) {
        set({ wishlist: [] });
      }
      return;
    }

    try {
      const res = await axios.get("/wishlist");
      set({ wishlist: res.data.wishlist || [] });
    } catch (err) {
      console.error("Error fetching wishlist", err);
      set({ wishlist: [] });
    }
  },

  addToWishlist: async (product) => {
    const { user } = useUserStore.getState();
    if (!user) {
      set((prev) => {
        const exists = prev.wishlist.find((p) => p._id === product._id);
        if (exists) {
          toast("Déjà dans la liste de souhaits");
          return prev;
        }
        const newList = [...prev.wishlist, product];
        try {
          localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(newList));
        } catch (e) {
          console.error("Failed saving guest wishlist", e);
        }
        toast.success("Produit ajouté à la liste de souhaits");
        return { wishlist: newList };
      });
      return;
    }

    try {
      await axios.post(`/wishlist/${product._id}`);
      toast.success("Produit ajouté à la liste de souhaits");
      get().getWishlist();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur ajout wishlist");
    }
  },

  removeFromWishlist: async (productId) => {
    const { user } = useUserStore.getState();
    if (!user) {
      set((prev) => {
        const newList = prev.wishlist.filter((p) => p._id !== productId);
        try {
          localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(newList));
        } catch (e) {
          console.error("Failed saving guest wishlist", e);
        }
        toast.success("Produit retiré de la liste de souhaits");
        return { wishlist: newList };
      });
      return;
    }

    try {
      await axios.delete(`/wishlist/${productId}`);
      toast.success("Produit retiré de la liste de souhaits");
      get().getWishlist();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur suppression wishlist");
    }
  },

  isInWishlist: (productId) => {
    const { wishlist } = get();
    return wishlist.some((p) => p._id === productId || p.product === productId);
  },

  syncLocalWishlistToBackend: async () => {
    const { user } = useUserStore.getState();
    if (!user) return;
    try {
      const stored = localStorage.getItem(GUEST_WISHLIST_KEY);
      const wishlist = stored ? JSON.parse(stored) : [];
      for (const item of wishlist) {
        try {
          await axios.post(`/wishlist/${item._id}`);
        } catch (e) {
          // ignore individual errors
        }
      }
      localStorage.removeItem(GUEST_WISHLIST_KEY);
      await get().getWishlist();
    } catch (e) {
      console.error("Error syncing guest wishlist", e);
    }
  },
}));

export default useWishlistStore;
