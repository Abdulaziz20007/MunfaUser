import { config } from "../config";

const { apiUrl } = config;

export const getProducts = async () => {
  try {
    const response = await fetch(`${apiUrl}/product`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const getTrendingProducts = async () => {
  try {
    // First try to get all products since trending endpoint might not exist
    const allProducts = await getProducts();

    // Return first 8 products as trending
    return allProducts.slice(0, 8);
  } catch (error) {
    console.error("Error fetching trending products:", error);
    throw error;
  }
};

export const getProduct = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/product/${id}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};
