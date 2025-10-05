import { createActividad } from "../services/ActividadService.js";

export async function registrarActividad(idUsuario, accionRealizada, descripcion, areaAfectada = "--") {
  const actividad = {
    idUsuario,
    accionRealizada,
    descripcion,
    areaAfectada,
    fecha: new Date().toISOString(), // opcional
    // No mandamos fecha: que la asigne el backend
  };

  try {
    await createActividad(actividad);
    console.log("Actividad registrada:", actividad);
  } catch (error) {
    console.error("Error al registrar actividad:", error);
  }
}