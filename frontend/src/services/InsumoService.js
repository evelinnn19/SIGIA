const BASE_URL = "http://localhost:8080/api/insumos"; 

// Obtener todos los insumos
export async function getInsumos() {
  const response = await fetch(BASE_URL);
  if (!response.ok) throw new Error("Error al obtener insumos");
  return await response.json();
}

// Obtener insumo por ID
export async function getInsumoById(id) {
  const response = await fetch(`${BASE_URL}/${id}`);
  if (!response.ok) throw new Error("Error al obtener insumo");
  return await response.json();
}

// Crear insumo
export async function createInsumo(insumo) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(insumo),
  });
  if (!response.ok) throw new Error("Error al crear insumo");
  return await response.json();
}

// Actualizar insumo
export async function updateInsumo(id, insumo) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(insumo),
  });
  if (!response.ok) throw new Error("Error al actualizar insumo");
  return true;
}

// Eliminar insumo
export async function deleteInsumo(id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Error al eliminar insumo");
  return true;
}

export async function getUltimoInsumoId() {
  const insumos = await getInsumos();
  // Ordenar por ID descendente y tomar la primera (más reciente)
  return insumos.sort((a, b) => b.idInsumo - a.idInsumo)[0];
}
