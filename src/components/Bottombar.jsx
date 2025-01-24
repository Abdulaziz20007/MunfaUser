import React, { useEffect, useRef } from "react";
import { Link, useLocation, NavLink } from "react-router-dom";
import {
  HomeIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  ShoppingCartIcon as ShoppingCartIconSolid,
} from "@heroicons/react/24/solid";
import { useCart } from "../contexts/CartContext";

const Bottombar = () => {
  const location = useLocation();
  const { cart } = useCart();
  const prevCountRef = useRef(cart.length);
  const badgeRef = useRef(null);

  useEffect(() => {
    if (cart.length > prevCountRef.current && badgeRef.current) {
      // Remove the class and force reflow to restart animation
      badgeRef.current.classList.remove("pop");
      badgeRef.current.offsetHeight;
      badgeRef.current.classList.add("pop");
    }
    prevCountRef.current = cart.length;
  }, [cart]);

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const navItems = [
    {
      name: "Bosh sahifa",
      path: "/",
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
    },
    {
      name: "Mahsulotlar",
      path: "/products",
      icon: ShoppingBagIcon,
      activeIcon: ShoppingBagIconSolid,
    },
    {
      name: "Savatcha",
      path: "/cart",
      icon: ShoppingCartIcon,
      activeIcon: ShoppingCartIconSolid,
      badge: getTotalItems(),
    },
  ];

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-grid">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const IconComponent = isActive ? item.activeIcon : item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`nav-item ${isActive ? "active" : ""}`}
              end={item.path === "/"}
            >
              <div className="nav-icon-wrapper">
                <IconComponent className="nav-icon" />
                {item.badge > 0 && (
                  <span
                    ref={item.path === "/cart" ? badgeRef : null}
                    className="nav-badge"
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="nav-text">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default Bottombar;
