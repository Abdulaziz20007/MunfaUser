import { refreshTokens } from "../services/refreshToken";

// Flag to track ongoing refresh
let isRefreshing = false;
let refreshPromise = null;

export const fetchWithAuth = async (url, options = {}) => {
  let accessToken = localStorage.getItem("accessToken");

  // Check if token is expired by decoding JWT
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  };

  // If token is expired, try to refresh before making the request
  if (isTokenExpired(accessToken)) {
    try {
      // If already refreshing, wait for that promise
      if (isRefreshing) {
        accessToken = await refreshPromise;
      } else {
        isRefreshing = true;
        refreshPromise = refreshTokens();
        accessToken = await refreshPromise;
        isRefreshing = false;
        refreshPromise = null;
      }
    } catch (error) {
      isRefreshing = false;
      refreshPromise = null;
      localStorage.removeItem("accessToken");
      window.location.href = "/";
      throw new Error("Authentication failed");
    }
  }

  const defaultOptions = {
    credentials: "include", // Important for cookies
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  let response = await fetch(url, mergedOptions);

  // If request fails with 401 and we haven't just refreshed, try refreshing token once
  if (response.status === 401 && !isRefreshing) {
    try {
      isRefreshing = true;
      refreshPromise = refreshTokens();
      accessToken = await refreshPromise;
      isRefreshing = false;
      refreshPromise = null;

      // Retry original request with new token
      response = await fetch(url, {
        ...mergedOptions,
        headers: {
          ...mergedOptions.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      isRefreshing = false;
      refreshPromise = null;
      localStorage.removeItem("accessToken");
      window.location.href = "/";
      throw new Error("Authentication failed");
    }
  }

  return response;
};
