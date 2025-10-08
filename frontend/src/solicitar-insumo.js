//estetica
     import { definirUsuario } from './services/usuarioEncabezado.js';

    document.addEventListener("DOMContentLoaded", () => {
        console.log('DOM cargado, ejecutando definirUsuario...');
        definirUsuario();
    });
//

import {getInsumos, updateInsumo} from './services/InsumoService.js'
import { createTransaccion } from './services/TransaccionService.js';
import { registrarActividad } from './services/actividadUtilidad.js';


// Extraer elementos del formulario individualmente
const form = document.querySelector('form');
const nombreInsumo = document.querySelector('select[name="nombre_insumo"]');
const areaSelect = document.querySelector('select[name="area"]');
const cantidad = document.querySelector('input[name="cantidad"]');
const nombreSolicitante = document.querySelector('input[name="nombre_solicitante"]');
const btnCancelar = document.querySelector('button[type="button"]');
const btnConfirmar = document.querySelector('button[type="submit"]');


//Estatico de areas
const Areas = [
"Seleccionar Area",
"Bedelía", 
"Posgrado", 
"Matemática", 
"Extensión", 
"GaME", 
"Académica",
"Consejo",
"RRHH",
"Agrimensura",
"Ciencia y Tecnica",
"Dpto Alumnos",
]


//Select area llenar
for(let area of Areas){
    let option = document.createElement('option');
    option.innerHTML = area;
    areaSelect.appendChild(option);
}


//Esto es para el select de insumos
let insumos = await getInsumos();
console.log(insumos)
for (let insumo of insumos){
    let option = document.createElement('option');
    option.innerText = insumo.nombre;
    nombreInsumo.appendChild(option);

}

// Variable global
let insumoSeleccionado = null;

// Event listeners únicos
nombreInsumo.addEventListener('change', () => {
    insumoSeleccionado = insumos.find(i => i.nombre == nombreInsumo.value);
    console.log(insumoSeleccionado);
    
    validarFormularioCompleto(); // Una sola función
});

cantidad.addEventListener('change', () => {
    validarFormularioCompleto(); // Una sola función
});

areaSelect.addEventListener('change', () => {
    validarFormularioCompleto(); // Una sola función
});

// Función centralizada que valida todo
function validarFormularioCompleto() {
    let formularioValido = true;
    let mensajes = [];
    
    // Limpiar mensajes anteriores
    const mensajeAnterior = document.querySelector('.mensaje-cantidad');
    if (mensajeAnterior) {
        mensajeAnterior.remove();
    }
    cantidad.style.outline = '';
    
    // Validar área
    const areaValida = areaSelect.value !== "Seleccionar Area";
    if (!areaValida) {
        formularioValido = false;
    }
    
    // Validar insumo seleccionado
    const insumoValido = nombreInsumo.value !== "";
    if (!insumoValido) {
        formularioValido = false;
    }
    
    // Validar cantidad (solo si hay insumo seleccionado)
    if (insumoSeleccionado && cantidad.value) {
        const cantidadSolicitada = Number(cantidad.value);
        if (cantidadSolicitada > insumoSeleccionado.stockActual) {
            formularioValido = false;
            
            // Mostrar mensaje de stock
            const mensaje = document.createElement('span');
            mensaje.className = 'mensaje-cantidad block text-red-600 text-xs mt-1 font-medium';
            mensaje.innerText = "Stock insuficiente";
            cantidad.parentNode.appendChild(mensaje);
            cantidad.style.outline = '2px solid rgba(239, 68, 68, 0.5)';
        }
    }
    
    // Habilitar/deshabilitar botón según validación completa
    deshabilitarBoton(!formularioValido);
}

function deshabilitarBoton(deshabilitar) {
    if(deshabilitar) {
        btnConfirmar.disabled = true;
        btnConfirmar.style.opacity = '0.5';
        btnConfirmar.style.cursor = 'not-allowed';
    } else {
        btnConfirmar.disabled = false;
        btnConfirmar.style.opacity = '1';
        btnConfirmar.style.cursor = 'pointer';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    deshabilitarBoton(true); // Inicialmente deshabilitado
});


const usuarioActual = localStorage.getItem('usuarioActual');


//Deberíamos agregar funcionalidad para los botones. Hagamoslo
//para confirmar el envio del formulario
form.addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevenir envío del formulario
    console.log(insumoSeleccionado.idInsumo)
    try {
        
        // Crear la transacción
        let transacción = {
            tipo: "egreso",
            fecha: new Date().toISOString().split('T')[0],
            cantidad: Number(cantidad.value), // Convertir a número
            areaDestino: areaSelect.value,
            solicitante: nombreSolicitante.value,
            idInsumo: insumoSeleccionado.idInsumo,
            idUsuario: usuarioActual
        };

        // Actualizar stock del insumo
        const cantidadSolicitada = Number(cantidad.value);
        insumoSeleccionado.stockActual -= cantidadSolicitada; // Corregido el operador

        await updateInsumo(insumoSeleccionado.idInsumo,insumoSeleccionado);
        await createTransaccion(transacción);
        
        await registrarActividad(
            usuarioActual,
            "Egreso",
            `${nombreSolicitante.value} llevó ${insumoSeleccionado.nombre}`,
            areaSelect.value
        );
        
       
        
        // Opcional: limpiar formulario o redirigir
        // form.reset();
        
    } catch (error) {
        console.error('Error al procesar solicitud:', error);
        alert('Error al procesar la solicitud');
    }
});

