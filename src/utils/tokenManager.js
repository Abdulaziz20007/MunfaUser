const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expiryTime;
  } catch {
    return true;
  }
};

export const getValidToken = async () => {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken || isTokenExpired(accessToken)) {
    try {
      const newToken = await refreshTokens();
      return newToken;
    } catch (error) {
      localStorage.removeItem("accessToken");
      throw error;
    }
  }

  return accessToken;
};
