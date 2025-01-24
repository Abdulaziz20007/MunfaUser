import { useState, useEffect } from "react";
import { getTrendingProducts } from "../services/productService";

export const useTrendingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      try {
        const data = await getTrendingProducts();
        if (mounted) {
          setProducts(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError("Mahsulotlarni yuklashda xatolik yuz berdi");
          setLoading(false);
          console.error("Error in useTrendingProducts:", err);
        }
      }
    };

    fetchProducts();

    return () => {
      mounted = false;
    };
  }, []);

  return { products, loading, error };
};
