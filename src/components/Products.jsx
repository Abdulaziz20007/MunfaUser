import { useEffect, useState } from "react";
import { config } from "../config";
import ProductCard from "./ProductCard";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${config.apiUrl}/product`);

        if (!response.ok) {
          throw new Error("Server error");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          setProducts([]);
          return;
        }

        setProducts(data.filter((product) => !product.deleted));
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (error && products.length === 0) {
    return (
      <div className="products-container">
        <h2 className="section-title">
          Barcha <span>mahsulotlar</span>
        </h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="products-container">
      <h2 className="section-title">
        Barcha <span>mahsulotlar</span>
      </h2>
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      {loading && <div className="loading-indicator">Yuklanmoqda...</div>}
      {error && <div className="error-message">{error}</div>}
      {!loading && products.length === 0 && !error && (
        <div className="empty-message">Mahsulotlar topilmadi</div>
      )}
    </div>
  );
};

export default Products;
