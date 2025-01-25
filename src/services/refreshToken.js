import { config } from "../config";

export const refreshTokens = async () => {
  try {
    const response = await fetch(`${config.apiUrl}/user/refresh`, {
      method: "POST",
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    localStorage.setItem("accessToken", data.accessToken);
    return data.accessToken;
  } catch (error) {
    localStorage.removeItem("accessToken");
    throw error;
  }
};
