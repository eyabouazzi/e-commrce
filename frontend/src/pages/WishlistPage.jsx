import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useWishlistStore } from "../stores/useWishlistStore";

const WishlistPage = () => {
  const { wishlist, getWishlist, removeFromWishlist } = useWishlistStore();

  // load wishlist on mount
  React.useEffect(() => {
    getWishlist();
  }, [getWishlist]);

  const normalized = (item) => {
    // backend may return { product: {...} } or product objects directly in guest mode
    return item.product ? item.product : item;
  };

  return (
    <div className='py-8 md:py-16'>
      <div className='mx-auto max-w-screen-xl px-4 2xl:px-0'>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className='text-3xl font-semibold mb-6 flex items-center gap-3'>
            <Heart className='text-rose-400' /> Wishlist
          </h1>

          {(!wishlist || wishlist.length === 0) ? (
            <EmptyWishlist />
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {wishlist.map((item) => {
                const p = normalized(item);
                return (
                  <div key={p._id} className='rounded-lg border border-gray-700 p-4'>
                    <img src={p.image} alt={p.name} className='w-full h-40 object-cover rounded-md mb-3' />
                    <h3 className='text-lg font-medium'>{p.name}</h3>
                    <p className='text-emerald-400 font-bold mt-1'>${p.price}</p>
                    <div className='mt-4 flex gap-2'>
                      <Link
                        to={`/product/${p._id}`}
                        className='rounded-md bg-emerald-600 px-3 py-1 text-white'
                      >
                        View
                      </Link>
                      <button
                        className='rounded-md border border-gray-600 px-3 py-1 text-white'
                        onClick={() => removeFromWishlist(p._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default WishlistPage;

const EmptyWishlist = () => (
  <motion.div
    className='flex flex-col items-center justify-center space-y-4 py-16'
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Heart className='h-24 w-24 text-rose-400' />
    <h3 className='text-2xl font-semibold '>Your wishlist is empty</h3>
    <p className='text-gray-400'>Add products to your wishlist to find them later.</p>
    <Link
      className='mt-4 rounded-md bg-emerald-500 px-6 py-2 text-white transition-colors hover:bg-emerald-600'
      to='/'
    >
      Start Shopping
    </Link>
  </motion.div>
);
