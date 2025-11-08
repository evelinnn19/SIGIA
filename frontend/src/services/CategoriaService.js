const BASE_URL = "http://localhost:8080/api/categorias";

/**
 * Obtiene todas las categorías de la API.
 * @returns {Promise<Array<Object>>} Una promesa que resuelve con la lista de categorías.
 */
export async function getCategorias() {
  const res = await fetch(BASE_URL);
  if (!res.ok) {
    // Si la respuesta no es OK (ej. 404, 500), lanzamos un error
    throw new Error("Error al obtener categorías");
  }
  return res.json();
}

/**
 * Obtiene una categoría por su ID.
 * @param {number|string} id El ID de la categoría.
 * @returns {Promise<Object>} Una promesa que resuelve con los datos de la categoría.
 */
export async function getCategoriaById(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) {
    throw new Error("Error al obtener categoría por ID");
  }
  return res.json();
}

/**
 * Crea una nueva categoría.
 * @param {Object} categoria El objeto categoría a crear (sin idCategoria).
 * @returns {Promise<string>} Una promesa que resuelve con el mensaje de éxito de la API.
 */
export async function createCategoria(categoria) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoria),
  });

  const text = await res.text(); // Leer la respuesta como texto plano

  if (!res.ok) {
    throw new Error(`Error al crear categoría: ${text}`);
  }
  return text; // Devuelve el mensaje: "Categoría creada con éxito"
}

/**
 * Actualiza una categoría existente.
 * @param {number|string} id El ID de la categoría a actualizar.
 * @param {Object} categoria El objeto categoría con los datos actualizados.
 * @returns {Promise<boolean>} Una promesa que resuelve a true si tiene éxito.
 */
export async function updateCategoria(id, categoria) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoria),
  });
  if (!res.ok) {
    throw new Error("Error al actualizar categoría");
  }
  return true; // Devuelve true si la actualización fue exitosa
}

/**
 * Elimina una categoría por su ID.
 * @param {number|string} id El ID de la categoría a eliminar.
 * @returns {Promise<boolean>} Una promesa que resuelve a true si tiene éxito.
 */
export async function deleteCategoria(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error("Error al eliminar categoría");
  }
  return true; // Devuelve true si la eliminación fue exitosa
}

// Función adicional para buscar por nombre, si es necesario usarla en el frontend
export async function getCategoriasByNombre(nombre) {
  const res = await fetch(`${BASE_URL}/nombre/${nombre}`);
  if (!res.ok) {
    throw new Error("Error al buscar categorías por nombre");
  }
  return res.json();
}