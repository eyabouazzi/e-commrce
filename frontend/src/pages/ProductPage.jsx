import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCartStore();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlistStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/products/${id}`);
        setProduct(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <div className="p-8">Loading...</div>;

    const inWishlist = isInWishlist(product._id);

    return (
      <div className="py-8 md:py-16">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="card overflow-hidden rounded-md">
              <img src={product.image} alt={product.name} className="w-full h-[520px] object-cover" />
            </div>

            <div>
              <h1 className="text-3xl font-semibold">{product.name}</h1>
              <p className="text-primary text-2xl font-bold mt-2">${product.price}</p>
              <p className="mt-4 text-muted">{product.description}</p>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => addToCart(product)}
                  className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-light"
                >
                  Add to cart
                </button>

                <button
                  onClick={() => (inWishlist ? removeFromWishlist(product._id) : addToWishlist(product))}
                  className="rounded-md border border-gray-700 px-4 py-2 text-white"
                >
                  {inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default ProductPage;
