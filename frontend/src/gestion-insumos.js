/**
 * GESTION DE INSUMOS Y NOTAS
 * Maneja el almacenamiento y recuperación de datos de notas e insumos
 */

// Clase para gestionar los datos de la nota
class GestionNotas {
  constructor() {
    this.storageKeyInsumos = 'insumos';
    this.storageKeyDatosNota = 'datosNota';
  }

  // Guardar datos de la nota
  guardarDatosNota(tramite, area, nombre, fecha) {
    const datosNota = {
      tramite: tramite,
      area: area,
      nombre: nombre,
      fecha: fecha
    };
    localStorage.setItem(this.storageKeyDatosNota, JSON.stringify(datosNota));
  }

  // Obtener datos de la nota
  obtenerDatosNota() {
    const datos = localStorage.getItem(this.storageKeyDatosNota);
    return datos ? JSON.parse(datos) : null;
  }

  // Guardar un nuevo insumo
  agregarInsumo(nombre, cantidad) {
    const insumos = this.obtenerInsumos();
    insumos.push({
      nombre: nombre,
      cantidad: parseInt(cantidad)
    });
    localStorage.setItem(this.storageKeyInsumos, JSON.stringify(insumos));
  }

  // Obtener todos los insumos
  obtenerInsumos() {
    const insumos = localStorage.getItem(this.storageKeyInsumos);
    return insumos ? JSON.parse(insumos) : [];
  }

  // Actualizar un insumo específico
  actualizarInsumo(index, nuevaCantidad) {
    const insumos = this.obtenerInsumos();
    if (index >= 0 && index < insumos.length) {
      insumos[index].cantidad = parseInt(nuevaCantidad);
      localStorage.setItem(this.storageKeyInsumos, JSON.stringify(insumos));
      return true;
    }
    return false;
  }

  // Eliminar un insumo específico
  eliminarInsumo(index) {
    const insumos = this.obtenerInsumos();
    if (index >= 0 && index < insumos.length) {
      insumos.splice(index, 1);
      localStorage.setItem(this.storageKeyInsumos, JSON.stringify(insumos));
      return true;
    }
    return false;
  }

  // Limpiar todos los datos
  limpiarTodo() {
    localStorage.removeItem(this.storageKeyInsumos);
    localStorage.removeItem(this.storageKeyDatosNota);
  }

  // Limpiar solo los insumos
  limpiarInsumos() {
    localStorage.removeItem(this.storageKeyInsumos);
  }

  // Verificar si hay datos de nota guardados
  tieneDatosNota() {
    return this.obtenerDatosNota() !== null;
  }

  // Verificar si hay insumos guardados
  tieneInsumos() {
    return this.obtenerInsumos().length > 0;
  }
}

// Exportar instancia única
const gestionNotas = new GestionNotas();