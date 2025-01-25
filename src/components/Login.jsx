import { useState } from "react";
import { config } from "../config";
import PropTypes from "prop-types";

const Login = ({ isOpen, onClose, onLogin, showAlert }) => {
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [otp, setOtp] = useState("");
  const [otpId, setOtpId] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const number = value.replace(/\D/g, "");

    // Format as 90 123 45 67
    if (number.length <= 2) return number;
    if (number.length <= 5) return `${number.slice(0, 2)} ${number.slice(2)}`;
    if (number.length <= 7)
      return `${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`;
    return `${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(
      5,
      7
    )} ${number.slice(7, 9)}`;
  };

  const handlePhoneChange = (e) => {
    const inputValue = e.target.value.replace(/\D/g, "");
    if (inputValue.length <= 9) {
      setPhone(inputValue);
    }
  };

  const validatePhone = (phoneNumber) => {
    const phoneRegex = /^[0-9]{9}$/;
    return phoneRegex.test(phoneNumber);
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validatePhone(phone)) {
      setError("Telefon raqam 9 ta raqamdan iborat bo'lishi kerak");
      setLoading(false);
      return;
    }

    try {
      const checkResponse = await fetch(`${config.apiUrl}/user/identify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const checkData = await checkResponse.json();

      if (checkResponse.status === 302 && checkData.found) {
        if (checkData.isVerified) {
          if (checkData.isRegistered) {
            setShowPassword(true);
            showAlert("Parolni kiriting", "success");
          } else {
            setShowRegister(true);
            showAlert("Ro'yxatdan o'tishni yakunlang", "success");
          }
        } else {
          const response = await fetch(`${config.apiUrl}/user/send`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ phone }),
          });

          const data = await response.json();

          if (response.ok || data.otpId) {
            setOtpId(data.otpId);
            setShowOtp(true);
            setError("");
            if (data.msg === "Tasdiqlash kodi avval yuborilgan") {
              showAlert("Tasdiqlash kodi avval yuborilgan", "success");
            } else {
              showAlert("Tasdiqlash kodi yuborildi", "success");
            }
          } else {
            setError(data.msg || "Xatolik yuz berdi");
            showAlert(data.msg || "Xatolik yuz berdi", "error");
          }
        }
      } else {
        await sendOtp();
      }
    } catch (err) {
      console.error("Phone submit error:", err);
      setError("Xatolik yuz berdi");
      showAlert("Xatolik yuz berdi", "error");
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/user/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.ok || data.otpId) {
        setOtpId(data.otpId);
        setShowOtp(true);
        setError("");
      } else {
        setError(data.msg || "Xatolik yuz berdi");
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      setError("Xatolik yuz berdi");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${config.apiUrl}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          password,
        }),
        withCredentials: true,
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        onClose();
        showAlert("Muvaffaqiyatli kirdingiz", "success");
        window.location.reload();
      } else {
        setError(data.msg || "Xatolik yuz berdi");
        showAlert(data.msg || "Xatolik yuz berdi", "error");
      }
    } catch (err) {
      setError("Xatolik yuz berdi");
      showAlert("Xatolik yuz berdi", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${config.apiUrl}/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          name,
          surname,
          password,
        }),
        withCredentials: true,
      });

      const data = await response.json();

      if (response.ok) {
        showAlert("Muvaffaqiyatli ro'yxatdan o'tdingiz", "success");
        const loginResponse = await fetch(`${config.apiUrl}/user/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone,
            password,
          }),
          withCredentials: true,
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
          localStorage.setItem("accessToken", loginData.accessToken);
          localStorage.setItem("refreshToken", loginData.refreshToken);
          onClose();
          window.location.reload();
        } else {
          setError(loginData.msg || "Kirish xatoligi yuz berdi");
          showAlert(loginData.msg || "Kirish xatoligi yuz berdi", "error");
        }
      } else {
        setError(data.msg || "Ro'yxatdan o'tishda xatolik yuz berdi");
        showAlert(data.msg || "Ro'yxatdan o'tishda xatolik yuz berdi", "error");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Xatolik yuz berdi");
      showAlert("Xatolik yuz berdi", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${config.apiUrl}/user/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          otp,
          otpId,
        }),
        withCredentials: true,
      });

      const data = await response.json();

      if (response.ok) {
        setShowRegister(true);
        setShowOtp(false);
        showAlert("Telefon raqam tasdiqlandi", "success");
      } else {
        setError(data.msg || "Xatolik yuz berdi");
        showAlert(data.msg || "Xatolik yuz berdi", "error");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      setError("Xatolik yuz berdi");
      showAlert("Xatolik yuz berdi", "error");
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/user/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
        withCredentials: true,
      });

      const data = await response.json();

      if (response.ok) {
        setError("");
        return data;
      } else if (data.otpId) {
        // If OTP was already sent, use the existing OTP ID
        setError(data.msg);
        return data;
      } else {
        setError(data.msg);
        return null;
      }
    } catch (err) {
      setError("Xatolik yuz berdi");
      return null;
    }
  };

  const formatPhoneForDisplay = (phoneNumber) => {
    if (!phoneNumber) return "";
    // Only format if we have numbers to format
    if (phoneNumber.length > 0) {
      const parts = [
        phoneNumber.slice(0, 2), // 94
        phoneNumber.slice(2, 5), // 444
        phoneNumber.slice(5, 7), // 80
        phoneNumber.slice(7, 9), // 88
      ].filter((part) => part.length > 0);

      return `+998 ${parts.join(" ")}`;
    }
    return "+998 ";
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close">
          ✕
        </button>

        <h2 className="modal-title">
          {showRegister
            ? "Ro'yxatdan o'tish"
            : showOtp
            ? "Tasdiqlash kodi"
            : showPassword
            ? "Parolni kiriting"
            : "Telefon raqami"}
        </h2>

        {error && <div className="error-message">{error}</div>}

        {!showOtp && !showRegister && !showPassword ? (
          <form onSubmit={handlePhoneSubmit}>
            <div className="phone-input-wrapper">
              <span className="phone-prefix">+998</span>
              <input
                type="text"
                placeholder="90 123 45 67"
                value={formatPhoneNumber(phone)}
                onChange={handlePhoneChange}
                className="phone-input"
                maxLength={13}
              />
            </div>
            <button type="submit" className="modal-button" disabled={loading}>
              {loading ? "Yuborilmoqda..." : "Kodni yuborish"}
            </button>
          </form>
        ) : showOtp ? (
          <form onSubmit={handleVerifyOtp}>
            <input
              type="text"
              placeholder="Tasdiqlash kodini kiriting"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="modal-input"
            />
            <button type="submit" className="modal-button" disabled={loading}>
              {loading ? "Tekshirilmoqda..." : "Tasdiqlash"}
            </button>
          </form>
        ) : showPassword ? (
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              placeholder="Parolni kiriting"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="modal-input"
              required
            />
            <button type="submit" className="modal-button" disabled={loading}>
              {loading ? "Yuklanmoqda..." : "Kirish"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Ismingiz"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="modal-input"
              required
            />
            <input
              type="text"
              placeholder="Familiyangiz"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="modal-input"
              required
            />
            <input
              type="password"
              placeholder="Parol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="modal-input"
              required
            />
            <button type="submit" className="modal-button" disabled={loading}>
              {loading ? "Yuklanmoqda..." : "Ro'yxatdan o'tish"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

Login.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
  showAlert: PropTypes.func.isRequired,
};

export default Login;
