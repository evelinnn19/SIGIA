const BASE_URL = "http://localhost:8080/api/transacciones";

export async function getTransacciones() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Error al obtener transacciones");
  return res.json();
}

export async function getTransaccionById(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Error al obtener transacción");
  return res.json();
}

export async function createTransaccion(transaccion) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaccion),
  });
  if (!res.ok) throw new Error("Error al crear transacción");
  
  // Clonar la respuesta para poder leerla dos veces
  const resClone = res.clone();
  
  try {
    return await res.json();
  } catch {
    // Si falla JSON, usar el clon para leer como texto
    return await resClone.text();
  }
}

export async function updateTransaccion(id, transaccion) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaccion),
  });
  if (!res.ok) throw new Error("Error al actualizar transacción");
  return true;
}

export async function deleteTransaccion(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar transacción");
  return true;
}

export async function getNameInsumoById(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Error al obtener insumo");
  const insumo = await res.json();
  return insumo.nombre;
}
