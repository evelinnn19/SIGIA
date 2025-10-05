const BASE_URL = "http://localhost:8080/api/actividades";

export async function getActividades() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Error al obtener actividades");
  return res.json();
}

export async function getActividadById(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Error al obtener actividad");
  return res.json();
}

export async function createActividad(actividad) {
  const res = await fetch("http://localhost:8080/api/actividades", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(actividad),
  });

  // no intentamos parsear como JSON
  const text = await res.text();

  if (!res.ok) throw new Error(`Error al crear actividad: ${text}`);
  return text; // será "Actividad creada"
}


export async function updateActividad(id, actividad) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(actividad),
  });
  if (!res.ok) throw new Error("Error al actualizar actividad");
  return true;
}

export async function deleteActividad(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar actividad");
  return true;
}
