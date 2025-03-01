import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { config } from "../config";
import { useCart } from "../contexts/CartContext";

const Cart = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [totalPrice, setTotalPrice] = useState(0);

  // Check if any product exceeds stock
  const hasStockIssue = cart.some((item) => item.quantity > item.stock);

  useEffect(() => {
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
  }, [cart]);

  const getStockWarning = (item) => {
    if (item.quantity > item.stock) {
      return `Mavjud emas: ${item.quantity - item.stock} dona ortiqcha`;
    }
    return null;
  };

  if (cart.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <h2>Savat bo'sh</h2>
          <p>Siz hali hech narsa tanlamadingiz</p>
          <button
            onClick={() => navigate("/")}
            className="modal-button browse-button"
          >
            Mahsulotlarni ko'rish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2 className="section-title">Savat</h2>
      <div className="cart-content">
        <div className="cart-items">
          {cart.map((item) => {
            const stockWarning = getStockWarning(item);
            const hasError = item.quantity > item.stock;

            return (
              <div
                key={item._id}
                className={`cart-item ${hasError ? "cart-item-error" : ""}`}
              >
                <div className="cart-item-image">
                  <img
                    src={`${config.baseUrl}/${item.image}`}
                    alt={item.name}
                  />
                </div>
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <div className="cart-item-price">
                    {item.price.toLocaleString()} so'm
                  </div>
                  {stockWarning && (
                    <div className="stock-warning">{stockWarning}</div>
                  )}
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn"
                      onClick={() =>
                        updateQuantity(item._id, Math.max(1, item.quantity - 1))
                      }
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() =>
                        updateQuantity(item._id, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.stock && item.stock !== 0}
                      title={
                        item.quantity >= item.stock && item.stock !== 0
                          ? "Maksimal miqdorga yetdi"
                          : ""
                      }
                    >
                      +
                    </button>
                  </div>
                  <div className="stock-info">
                    <span className="available-stock">
                      Mavjud: {item.stock} dona
                    </span>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item._id)}
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cart-summary">
          <div className="total-price">
            <span>Jami:</span>
            <span>{totalPrice.toLocaleString()} so'm</span>
          </div>
          <button
            onClick={() => navigate("/checkout")}
            className="checkout-btn"
            disabled={hasStockIssue}
            title={
              hasStockIssue
                ? "Ba'zi mahsulotlar miqdori mavjud miqdordan ortiq"
                : ""
            }
          >
            Buyurtma berish
          </button>
          {hasStockIssue && (
            <div className="checkout-warning">
              Buyurtma berish uchun mahsulotlar miqdorini to'g'rilang
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
