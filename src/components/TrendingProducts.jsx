import ProductCard from "./ProductCard";
import { useTrendingProducts } from "../hooks/useTrendingProducts";

const TrendingProducts = () => {
  const { products, loading, error } = useTrendingProducts();

  if (loading) {
    return <div className="loading-text">Yuklanmoqda...</div>;
  }

  if (error) {
    return <div className="error-text">{error}</div>;
  }

  return (
    <>
      <h1 className="section-title">
        Trend <span>mahsulotlar</span>
      </h1>
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </>
  );
};

export default TrendingProducts;
