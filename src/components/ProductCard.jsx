import { Link } from "react-router-dom";
import { config } from "../config";
import PropTypes from "prop-types";
import { useCart } from "../contexts/CartContext";
import { useState } from "react";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [showPassword, setShowPassword] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Create floating animation
    const button = e.currentTarget;
    const buttonRect = button.getBoundingClientRect();
    const cartIcon = document.querySelector(
      '.bottom-nav [href="/cart"] .nav-icon'
    );
    const cartRect = cartIcon.getBoundingClientRect();

    const floatingEl = document.createElement("div");
    floatingEl.className = "floating-cart-item";

    // Create and add image to floating element
    const img = document.createElement("img");
    img.src = `${config.baseUrl}/${product.images[0]}`;
    floatingEl.appendChild(img);

    // Position the floating element at the button's position
    floatingEl.style.top = `${buttonRect.top}px`;
    floatingEl.style.left = `${buttonRect.left}px`;

    document.body.appendChild(floatingEl);

    // Trigger the animation
    requestAnimationFrame(() => {
      floatingEl.style.top = `${cartRect.top + cartRect.height / 2}px`;
      floatingEl.style.left = `${cartRect.left + cartRect.width / 2}px`;
      floatingEl.style.transform = "scale(0.2)";
      floatingEl.style.opacity = "0";
    });

    // Remove the element after animation
    floatingEl.addEventListener("transitionend", () => {
      document.body.removeChild(floatingEl);
    });

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

  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <div className="product-image-wrapper">
        <img
          src={`${config.baseUrl}/${product.images[0]}`}
          alt={product.name}
          className="product-image"
        />
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>

        <div className="product-price">
          <span>{product.price.toLocaleString()} so'm</span>
        </div>
        <div className="product-meta">
          <span className="product-size">Razmer: {product.size}</span>
          <div className="product-quantity">
            <span>Pachkada: {product.quantityInBox} dona</span>
          </div>
          <div className="stock-action">
            {product.stock ? (
              <span className="product-stock in-stock">Sotuvda bor</span>
            ) : (
              <span className="product-stock out-stock">Sotuvda yo'q</span>
            )}
            <button
              onClick={handleAddToCart}
              className="add-to-cart-btn"
              disabled={!product.stock}
              aria-label="Add to cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    size: PropTypes.string.isRequired,
    quantityInBox: PropTypes.number.isRequired,
    stock: PropTypes.bool.isRequired,
  }).isRequired,
};

export default ProductCard;
