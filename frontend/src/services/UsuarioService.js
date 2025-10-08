const BASE_URL = "http://localhost:8080/api/usuarios";

export async function getUsuarios() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Error al obtener usuarios");
  return res.json();
}

export async function getUsuarioById(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Error al obtener usuario");
  return res.json();
}

export async function getUsuarioByMail(Mail) {
  const res = await fetch(`${BASE_URL}/mail/${encodeURIComponent(Mail)}`);
  if(!res.ok) throw new Error("Error al obtener usuario");
  return res.json()
}

export async function createUsuario(usuario) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario),
  });
  if (!res.ok) throw new Error("Error al crear usuario");
  return res.json();
}

export async function updateUsuario(id, usuario) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario),
  });
  if (!res.ok) throw new Error("Error al actualizar usuario");
  return true;
}

export async function deleteUsuario(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar usuario");
  return true;
}
