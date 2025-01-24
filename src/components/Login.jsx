import { useState } from "react";
import { config } from "../config";

const Login = ({ isOpen, onClose, onLogin }) => {
  const [step, setStep] = useState("phone"); // phone, password, register, otp
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

  const handlePhoneChange = (e) => {
    const inputValue = e.target.value;
    // Remove the prefix and any spaces from the input
    const cleanValue = inputValue.replace(/^\+998\s?/, "").replace(/\s/g, "");
    // Remove any non-digits
    const numbersOnly = cleanValue.replace(/\D/g, "");

    // Always allow backspace by checking if the new value is shorter
    if (
      numbersOnly.length <= 9 &&
      (phone.length > numbersOnly.length || numbersOnly.length <= 9)
    ) {
      setPhone(numbersOnly);
      setError("");
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

      // Status 302 means user was found
      if (checkResponse.status === 302 && checkData.found) {
        if (checkData.isVerified) {
          if (checkData.isRegistered) {
            // If user is verified and registered, show password input
            setShowPassword(true);
          } else {
            // If user is verified but not registered, show registration form
            setShowRegister(true);
          }
        } else {
          // If not verified, send OTP
          await sendOtp();
        }
      } else {
        // User not found (404) or other cases, send OTP for new user
        await sendOtp();
      }
    } catch (err) {
      console.error("Phone submit error:", err);
      setError("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to send OTP
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
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        onClose();
        window.location.reload();
      } else {
        setError(data.msg || "Xatolik yuz berdi");
      }
    } catch (err) {
      setError("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // First register the user
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
      });

      const data = await response.json();

      if (response.ok) {
        // After successful registration, try to login
        const loginResponse = await fetch(`${config.apiUrl}/user/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone,
            password,
          }),
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
          localStorage.setItem("accessToken", loginData.accessToken);
          localStorage.setItem("refreshToken", loginData.refreshToken);
          onClose();
          window.location.reload();
        } else {
          setError(loginData.msg || "Kirish xatoligi yuz berdi");
        }
      } else {
        setError(data.msg || "Ro'yxatdan o'tishda xatolik yuz berdi");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Xatolik yuz berdi");
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
      });

      const data = await response.json();

      if (response.ok) {
        // After successful verification, reidentify the user
        const checkResponse = await fetch(`${config.apiUrl}/user/identify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phone }),
        });

        const checkData = await checkResponse.json();

        if (checkResponse.status === 302 && checkData.found) {
          if (checkData.isVerified && !checkData.isRegistered) {
            // If verified but not registered, show registration form
            setShowRegister(true);
            setShowOtp(false);
          } else if (checkData.isVerified && checkData.isRegistered) {
            // If verified and registered, complete login
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            onClose();
            window.location.reload();
          }
        } else {
          setError("Foydalanuvchi topilmadi");
        }
      } else {
        setError(data.msg || "Xatolik yuz berdi");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      setError("Xatolik yuz berdi");
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
                type="tel"
                placeholder="90 123 45 67"
                value={formatPhoneForDisplay(phone).slice(5)} // Remove +998 prefix
                onChange={handlePhoneChange}
                className="modal-input phone-input"
                maxLength={12}
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

export default Login;
