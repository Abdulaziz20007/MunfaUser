import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { config } from "../config";
import { useCart } from "../contexts/CartContext";
import Header from "./Header";
import ProductCard from "./ProductCard";

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, updateQuantity, removeFromCart, cart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [randomProducts, setRandomProducts] = useState([]);
  const [showGallery, setShowGallery] = useState(false);

  const cartItem = cart.find((item) => item._id === id);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${config.apiUrl}/product/${id}`);
        const data = await response.json();

        if (response.ok) {
          setProduct(data);
          // Fetch all products for random selection
          const productsResponse = await fetch(`${config.apiUrl}/product`);
          const productsData = await productsResponse.json();

          if (productsResponse.ok && Array.isArray(productsData)) {
            // Filter out current product and get random products
            const otherProducts = productsData.filter(
              (p) => p._id !== id && !p.deleted
            );
            const shuffled = otherProducts.sort(() => 0.5 - Math.random());
            setRandomProducts(shuffled.slice(0, 4)); // Get 4 random products
          }
        } else {
          setError(data.msg || "Mahsulot topilmadi");
        }
      } catch (err) {
        setError("Xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product.stock) return;

    const cartProduct = {
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1,
      stock: product.stock,
    };

    addToCart(cartProduct);

    // Add pop animation to cart badge
    const badge = document.querySelector(".nav-badge");
    if (badge) {
      badge.classList.remove("pop");
      void badge.offsetWidth; // Trigger reflow
      badge.classList.add("pop");
    }
  };

  const handleUpdateQuantity = (newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
    } else {
      updateQuantity(id, newQuantity);
    }

    // Add pop animation to cart badge
    const badge = document.querySelector(".nav-badge");
    if (badge) {
      badge.classList.remove("pop");
      void badge.offsetWidth;
      badge.classList.add("pop");
    }
  };

  const handleImageClick = () => {
    setShowGallery(true);
  };

  const handleCloseGallery = () => {
    setShowGallery(false);
  };

  const handleNextImage = () => {
    setSelectedImage((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    setSelectedImage((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="main-container">
        <Header />
        <div className="loading-indicator">Yuklanmoqda...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="main-container">
        <Header />
        <div className="error-message">{error || "Mahsulot topilmadi"}</div>
        <button onClick={() => navigate("/")} className="back-button">
          Orqaga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="main-container">
      <Header />
      <div className="product-detail">
        <div className="product-images">
          <div className="main-image" onClick={handleImageClick}>
            <img
              src={`${config.baseUrl}/${product.images[selectedImage]}`}
              alt={product.name}
            />
            {product.images.length > 1 && (
              <div className="image-zoom-hint">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="image-thumbnails">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  className={`thumbnail ${
                    selectedImage === index ? "active" : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={`${config.baseUrl}/${image}`} alt={product.name} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-info-detail">
          <h1 className="product-title-detail">{product.name}</h1>

          <div className="product-meta-detail">
            <div className="product-price-detail">
              <span className="price">
                {product.price.toLocaleString()} so'm
              </span>
            </div>

            <div className="product-specs">
              <div className="spec-item">
                <span className="spec-label">Razmer:</span>
                <span className="spec-value">{product.size}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Pachkada:</span>
                <span className="spec-value">{product.quantityInBox} dona</span>
              </div>
            </div>

            <div className="stock-status">
              {product.stock ? (
                <span className="in-stock">Sotuvda bor</span>
              ) : (
                <span className="out-stock">Sotuvda yo'q</span>
              )}
            </div>

            {cartItem ? (
              <div className="product-quantity-wrapper">
                <div className="quantity-controls product-quantity-controls">
                  <button
                    className="quantity-btn"
                    onClick={() => handleUpdateQuantity(cartItem.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="quantity">{cartItem.quantity}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => handleUpdateQuantity(cartItem.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <div className="product-total">
                  Jami: {(cartItem.quantity * product.price).toLocaleString()}{" "}
                  so'm
                </div>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="add-to-cart-button"
                disabled={!product.stock}
              >
                {product.stock ? "Savatga qo'shish" : "Sotuvda yo'q"}
              </button>
            )}
          </div>

          {product.description && (
            <div className="product-description">
              <h2>Mahsulot haqida</h2>
              <p>{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {showGallery && (
        <div className="gallery-overlay" onClick={handleCloseGallery}>
          <div className="gallery-content" onClick={(e) => e.stopPropagation()}>
            <button className="gallery-close" onClick={handleCloseGallery}>
              ✕
            </button>
            <div className="gallery-image">
              <img
                src={`${config.baseUrl}/${product.images[selectedImage]}`}
                alt={product.name}
              />
            </div>
            {product.images.length > 1 && (
              <>
                <button className="gallery-nav prev" onClick={handlePrevImage}>
                  ‹
                </button>
                <button className="gallery-nav next" onClick={handleNextImage}>
                  ›
                </button>
                <div className="gallery-counter">
                  {selectedImage + 1} / {product.images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {randomProducts.length > 0 && (
        <div className="random-products">
          <h2 className="section-title">
            Boshqa <span>mahsulotlar</span>
          </h2>
          <div className="products-grid">
            {randomProducts.map((randomProduct) => (
              <ProductCard key={randomProduct._id} product={randomProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;
