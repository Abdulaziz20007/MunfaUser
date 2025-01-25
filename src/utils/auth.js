import { refreshTokens } from "../services/refreshToken";

export const fetchWithAuth = async (url, options = {}) => {
  let accessToken = localStorage.getItem("accessToken");

  const defaultOptions = {
    withCredentials: true, // Enable sending/receiving cookies
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  };

  // Merge the default options with the provided options
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  const response = await fetch(url, mergedOptions);

  if (response.status === 401) {
    try {
      accessToken = await refreshTokens();

      return fetch(url, {
        ...mergedOptions,
        headers: {
          ...mergedOptions.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch {
      localStorage.removeItem("accessToken");
      throw new Error("Authentication failed");
    }
  }

  return response;
};
