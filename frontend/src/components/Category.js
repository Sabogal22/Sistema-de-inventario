import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Categorías por página
  const token = localStorage.getItem("access_token");

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://127.0.0.1:8000/category/all/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las categorías",
        confirmButtonColor: "#198754",
      });
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async () => {
    if (newCategory.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Campo requerido",
        text: "El nombre de la categoría no puede estar vacío",
        confirmButtonColor: "#198754",
      });
      return;
    }
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/category/create/",
        { name: newCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedCategories = [...categories, response.data];
      setCategories(updatedCategories);
      setNewCategory("");

      // Actualiza la página a la última con el nuevo total
      const newTotalPages = Math.ceil(updatedCategories.length / itemsPerPage);
      setCurrentPage(newTotalPages);

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Categoría agregada correctamente",
        confirmButtonColor: "#198754",
      });
    } catch (error) {
      console.error("Error al agregar categoría:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "No se pudo agregar la categoría",
        confirmButtonColor: "#198754",
      });
    }
  };

  const startEditing = (category) => {
    setEditingCategory(category.id);
    setEditedName(category.name);
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditedName("");
  };

  const updateCategory = async (id) => {
    if (editedName.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Campo requerido",
        text: "El nombre de la categoría no puede estar vacío",
        confirmButtonColor: "#198754",
      });
      return;
    }
    try {
      await axios.put(
        `http://127.0.0.1:8000/category/${id}/update/`,
        { name: editedName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories(categories.map(cat => (cat.id === id ? { ...cat, name: editedName } : cat)));
      setEditingCategory(null);
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Categoría actualizada correctamente",
        confirmButtonColor: "#198754",
      });
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "No se pudo actualizar la categoría",
        confirmButtonColor: "#198754",
      });
    }
  };

  const deleteCategory = async (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#198754",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://127.0.0.1:8000/category/${id}/delete/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const updatedCategories = categories.filter(cat => cat.id !== id);
          setCategories(updatedCategories);
          Swal.fire({
            icon: "success",
            title: "¡Eliminado!",
            text: "Categoría eliminada correctamente",
            confirmButtonColor: "#198754",
          });
          // Ajustar página si eliminaste el último item de la última página
          const lastPage = Math.ceil(updatedCategories.length / itemsPerPage);
          if (currentPage > lastPage) setCurrentPage(lastPage);
        } catch (error) {
          console.error("Error al eliminar categoría:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || "No se pudo eliminar la categoría",
            confirmButtonColor: "#198754",
          });
        }
      }
    });
  };

  // Paginación client-side:
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = categories.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (pageNumber) => {
    if (pageNumber < 1) return;
    if (pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container py-4">
      <div className="card shadow border-0">
        <div className="card-header bg-success text-white py-3">
          <h2 className="mb-0 d-flex align-items-center">
            <i className="fa-solid fa-tags me-3"></i>
            Gestión de Categorías
          </h2>
        </div>

        <div className="card-body">
          {/* Formulario para agregar nueva categoría */}
          <div className="row mb-4">
            <div className="col-md-12">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Nombre de la nueva categoría"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCategory()}
                />
                <button
                  className="btn btn-success px-4"
                  onClick={addCategory}
                  disabled={!newCategory.trim()}
                >
                  <i className="fa-solid fa-plus me-2"></i> Agregar
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de categorías */}
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th className="w-25">ID</th>
                  <th>Nombre</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="3" className="text-center py-4">
                      <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-muted">
                      <i className="fa-solid fa-inbox fa-2x mb-3"></i>
                      <p className="mb-0 fw-bold">No hay categorías registradas</p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((category) => (
                    <tr
                      key={category.id}
                      className={editingCategory === category.id ? "table-active" : ""}
                    >
                      <td className="fw-bold">{category.id}</td>
                      <td>
                        {editingCategory === category.id ? (
                          <input
                            type="text"
                            className="form-control"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          <span className="d-flex align-items-center">
                            <i className="fa-solid fa-tag text-success me-2"></i>
                            {category.name}
                          </span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end">
                          {editingCategory === category.id ? (
                            <>
                              <button
                                className="btn btn-sm btn-success me-2"
                                onClick={() => updateCategory(category.id)}
                                disabled={!editedName.trim() || editedName === category.name}
                                title="Guardar cambios"
                              >
                                <i className="fa-solid fa-check"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={cancelEditing}
                                title="Cancelar edición"
                              >
                                <i className="fa-solid fa-times"></i>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn btn-sm btn-outline-warning me-2"
                                onClick={() => startEditing(category)}
                                title="Editar categoría"
                              >
                                <i className="fa-solid fa-pen"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => deleteCategory(category.id)}
                                title="Eliminar categoría"
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <nav aria-label="Page navigation example">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => goToPage(currentPage - 1)}>
                    Anterior
                  </button>
                </li>
                {[...Array(totalPages)].map((_, idx) => {
                  const page = idx + 1;
                  return (
                    <li
                      key={page}
                      className={`page-item ${page === currentPage ? "active" : ""}`}
                    >
                      <button className="page-link" onClick={() => goToPage(page)}>
                        {page}
                      </button>
                    </li>
                  );
                })}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => goToPage(currentPage + 1)}>
                    Siguiente
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;