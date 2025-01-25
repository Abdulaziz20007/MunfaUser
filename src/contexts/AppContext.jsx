import { createContext, useContext, useState } from "react";
import CustomAlert from "../alerts/CustomAlerts";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  const showAlert = ({ message, type = "success", onConfirm, onCancel }) => {
    setAlert({ message, type, onConfirm, onCancel });
  };

  const hideAlert = () => {
    setAlert(null);
  };

  return (
    <AppContext.Provider value={{ alert, showAlert, hideAlert }}>
      {children}
      <CustomAlert />
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
