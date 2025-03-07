import React, { useState } from "react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-logo">Mi Dashboard</div>

      {/* Botón de menú para móviles */}
      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      {/* Menú de navegación */}
      <ul>
        <li><a href="/">Inicio</a></li>
        <li><a href="/products">Productos</a></li>
        <li><a href="/login">Login</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;
