import { useState, useEffect } from "react";

const Inventario = () => {
  const [items, setItems] = useState([]);
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/inventario/")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error(err));
  }, []);

  const handleDelete = async (id) => {
    if (!token) return;

    const response = await fetch(`http://127.0.0.1:8000/api/inventario/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      setItems(items.filter((item) => item.id !== id));
    } else {
      alert("No tienes permiso para eliminar este ítem.");
    }
  };

  return (
    <div>
      <h1>Inventario</h1>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name} - {item.quantity}
            {token && (
              <>
                <button onClick={() => handleDelete(item.id)}>Eliminar</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Inventario;
