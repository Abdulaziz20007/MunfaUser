import { useEffect, useState } from "react";
import { useApp } from "../contexts/AppContext";

const CustomAlert = () => {
  const { alert, hideAlert } = useApp();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (alert) {
      setIsVisible(true);

      // Only set timer for non-confirmation alerts
      if (alert.type !== "confirm") {
        const timer = setTimeout(() => {
          setIsVisible(false);
          // Give time for fade out animation before hiding
          setTimeout(hideAlert, 300);
        }, 5000);

        return () => clearTimeout(timer);
      }
    }
  }, [alert, hideAlert]);

  if (!alert) return null;

  const handleConfirm = () => {
    if (alert.onConfirm) {
      alert.onConfirm();
    }
    hideAlert();
  };

  const handleCancel = () => {
    if (alert.onCancel) {
      alert.onCancel();
    }
    hideAlert();
  };

  return (
    <div className="custom-alert-wrapper">
      <div className={`custom-alert ${alert.type} ${!isVisible ? "hide" : ""}`}>
        {alert.type === "confirm" ? (
          <>
            <div className="alert-message">{alert.message}</div>
            <div className="alert-actions">
              <button onClick={handleConfirm} className="confirm-button">
                Ha
              </button>
              <button onClick={handleCancel} className="cancel-alert-button">
                Yo'q
              </button>
            </div>
          </>
        ) : (
          <>
            <svg
              className={`alert-icon ${alert.type}`}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {alert.type === "success" ? (
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <svg
                  className={`alert-icon ${alert.type}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 8v4M12 16h.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </svg>
            <span className="alert-message">{alert.message}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomAlert;
