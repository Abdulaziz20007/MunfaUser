import { createContext, useContext, useEffect, useState } from "react";

const TelegramContext = createContext();

export const TelegramProvider = ({ children }) => {
  const [webApp, setWebApp] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setWebApp(tg);

      // Get user data if available
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      }

      // Handle back button
      tg.BackButton.onClick(() => {
        window.history.back();
      });

      // Update back button visibility on route change
      const updateBackButton = () => {
        if (window.location.pathname === "/") {
          tg.BackButton.hide();
        } else {
          tg.BackButton.show();
        }
      };

      window.addEventListener("popstate", updateBackButton);
      updateBackButton();

      return () => {
        window.removeEventListener("popstate", updateBackButton);
      };
    }
  }, []);

  const showMainButton = (text, onClick) => {
    if (webApp) {
      webApp.MainButton.text = text;
      webApp.MainButton.onClick(onClick);
      webApp.MainButton.show();
    }
  };

  const hideMainButton = () => {
    if (webApp) {
      webApp.MainButton.hide();
    }
  };

  return (
    <TelegramContext.Provider
      value={{
        webApp,
        user,
        showMainButton,
        hideMainButton,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => useContext(TelegramContext);
