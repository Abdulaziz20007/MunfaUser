import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/productService";
import Header from "../components/Header";
import TrendingProducts from "../components/TrendingProducts";

const HomePage = () => {
  return (
    <div className="main-container">
      <Header />
      <TrendingProducts />
    </div>
  );
};

export default HomePage;
