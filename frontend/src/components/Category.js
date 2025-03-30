import React,{ useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editedName, setEditedName] = useState("");
  const token = localStorage.getItem("access_token");

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/category/all/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async () => {
    if (newCategory.trim() === "") {
      Swal.fire("Error", "El nombre de la categoría no puede estar vacío", "error");
      return;
    }
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/category/create/",
        { name: newCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories([...categories, response.data]);
      setNewCategory("");
      Swal.fire("Éxito", "Categoría agregada correctamente", "success");
    } catch (error) {
      console.error("Error al agregar categoría:", error);
      Swal.fire("Error", "No se pudo agregar la categoría", "error");
    }
  };

  const startEditing = (category) => {
    setEditingCategory(category.id);
    setEditedName(category.name);
  }

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditedName("");
  };

  const updateCategory = async (id) => {
    if (editedName.trim() === "") {
      Swal.fire("Error", "El nombre de la categoría no puede estar vacío", "error");
      return;
    }
    try {
      await axios.put(
        `http://127.0.0.1:8000/category/${id}/update/`,
        { name: editedName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories(categories.map((cat) => (cat.id === id ? { ...cat, name: editedName } : cat)));
      setEditingCategory(null);
      Swal.fire("Éxito", "Categoría actualizada correctamente", "success");
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      Swal.fire("Error", "No se pudo actualizar la categoría", "error");
    }
  };

  const deleteCategory = async (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la categoría permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://127.0.0.1:8000/category/${id}/delete/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCategories(categories.filter((cat) => cat.id !== id));
          Swal.fire("Éxito", "Categoría eliminada correctamente", "success");
        } catch (error) {
          console.error("Error al eliminar categoría:", error);
          Swal.fire("Error", "No se pudo eliminar la categoría", "error");
        }
      }
    });
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-lg p-4">
        <h2 className="text-primary mb-3">
        <i className="fa-solid fa-map-marker-alt me-2"></i> Lista de Categorías
        </h2>

        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Nueva categoría"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button className="btn btn-primary" onClick={addCategory}>
            <i className="fa-solid fa-save me-2"></i>Guardar
          </button>
        </div>

        <table className="table table-hover">
          <thead className="table-dark">
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Nombre</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>
                    {editingCategory === category.id ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                      />
                    ) : (
                      category.name
                    )}
                  </td>
                  <td>
                    {editingCategory === category.id ? (
                      <>
                        <button className="btn btn-success me-2" onClick={() => updateCategory(category.id)}>
                          <i className="fa-solid fa-check"></i>
                        </button>
                        <button className="btn btn-secondary" onClick={cancelEditing}>
                          <i className="fa-solid fa-times"></i>
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-warning me-2" onClick={() => startEditing(category)}>
                          <i className="fa-solid fa-edit"></i>
                        </button>
                        <button className="btn btn-danger" onClick={() => deleteCategory(category.id)}>
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">No hay categorías disponibles</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Category;