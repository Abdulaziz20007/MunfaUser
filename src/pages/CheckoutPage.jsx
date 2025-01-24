import React from "react";
import Header from "../components/Header";
import Checkout from "../components/Checkout";

const CheckoutPage = () => {
  return (
    <>
      <Header />
      <main className="main-container">
        <Checkout />
      </main>
    </>
  );
};

export default CheckoutPage;
