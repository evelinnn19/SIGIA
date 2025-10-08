const BASE_URL = "http://localhost:8080/api/insumos"; 

export async function getInsumos() {
  const response = await fetch(BASE_URL);
  if (!response.ok) throw new Error("Error al obtener insumos");
  return await response.json();
}

export async function getInsumoById(id) {
  const response = await fetch(`${BASE_URL}/${id}`);
  if (!response.ok) throw new Error("Error al obtener insumo");
  return await response.json();
}

export async function createInsumo(insumo) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(insumo),
  });
  if (!response.ok) throw new Error("Error al crear insumo");
  return await response.json();
}

export async function updateInsumo(id, insumo) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(insumo),
  });
  if (!response.ok) throw new Error("Error al actualizar insumo");
  return true;
}

export async function deleteInsumo(id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Error al eliminar insumo");
  return true;
}

export async function getUltimoInsumoId() {
  const insumos = await getInsumos();
  return insumos.sort((a, b) => b.idInsumo - a.idInsumo)[0];
}
