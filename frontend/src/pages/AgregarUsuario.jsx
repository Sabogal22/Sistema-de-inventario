import { useState } from "react";

const AgregarUsuario = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("pasante");
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://127.0.0.1:8000/api/usuarios/crear/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, password, role }),
    });

    if (response.ok) {
      alert("Usuario agregado correctamente.");
    } else {
      alert("Error al agregar usuario.");
    }
  };

  return (
    <div>
      <h1>Agregar Usuario</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="pasante">Pasante</option>
          <option value="admin">Administrador</option>
        </select>
        <button type="submit">Crear Usuario</button>
      </form>
    </div>
  );
};

export default AgregarUsuario;
