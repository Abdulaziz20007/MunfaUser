import { useState } from "react";
import { config } from "../config";
import { fetchWithAuth } from "../utils/auth";

const EditOrderModal = ({ order, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    address: order.address || "",
    comment: order.comment || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetchWithAuth(
        `${config.apiUrl}/user/order/${order.orderNumber}/update`,
        {
          method: "PUT",
          body: JSON.stringify({
            address: form.address.trim(),
            comment: form.comment.trim(),
          }),
        }
      );

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.msg || "Xatolik yuz berdi");
      }
    } catch (err) {
      setError("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close">
          ✕
        </button>

        <h2 className="modal-title">Buyurtmani tahrirlash</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label className="form-label">Manzil *</label>
            <textarea
              value={form.address}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, address: e.target.value }))
              }
              className="modal-input"
              placeholder="Manzilni kiriting"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Izoh</label>
            <textarea
              value={form.comment}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, comment: e.target.value }))
              }
              className="modal-input"
              placeholder="Izoh qoldiring"
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="modal-button" disabled={loading}>
              {loading ? "Saqlanmoqda..." : "Saqlash"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="modal-button secondary"
            >
              Bekor qilish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrderModal;
