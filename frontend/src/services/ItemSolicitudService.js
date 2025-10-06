const BASE_URL = "http://localhost:8080/api/item-solicitudes";

export async function getItemSolicitudes() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Error al obtener items de solicitud");
  return res.json();
}

export async function getItemSolicitudById(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Error al obtener item de solicitud");
  return res.json();
}

export async function createItemSolicitud(item) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error("Error al crear item de solicitud");
  
  // Cambiar de res.json() a res.text() porque devuelve string
  const message = await res.text();
  console.log(message); // "Item de solicitud creado"
  return message;
}

export async function updateItemSolicitud(id, item) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error("Error al actualizar item de solicitud");
  return true;
}

export async function deleteItemSolicitud(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar item de solicitud");
  return true;
}
