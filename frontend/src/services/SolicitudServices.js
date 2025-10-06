const BASE_URL = "http://localhost:8080/api/solicitudes";

export async function getSolicitudes() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Error al obtener solicitudes");
  return res.json();
}

export async function getSolicitudById(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Error al obtener solicitud");
  return res.json();
}

// Modifica tu servicio para manejar el string
export async function createSolicitud(solicitud) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(solicitud),
  });
  if (!res.ok) throw new Error("Error al crear solicitud");
  
  // Como devuelve texto plano, no parseamos JSON
  const message = await res.text();
  console.log(message); // "Solicitud creada"
  return message;
}

// Agregar función para obtener la última solicitud
export async function getUltimaSolicitud() {
  const solicitudes = await getSolicitudes();
  // Ordenar por ID descendente y tomar la primera (más reciente)
  return solicitudes.sort((a, b) => b.idSolicitud - a.idSolicitud)[0];
}

export async function updateSolicitud(id, solicitud) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(solicitud),
  });
  if (!res.ok) throw new Error("Error al actualizar solicitud");
  return true;
}

export async function deleteSolicitud(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar solicitud");
  return true;
}


export async function updateEstadoSolicitud(id, estado) {
  const res = await fetch(`${BASE_URL}/${id}/estado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });
  if (!res.ok) throw new Error("Error al actualizar estado de solicitud");
  return true;
}

