     import { definirUsuario } from './services/usuarioEncabezado.js';

    document.addEventListener("DOMContentLoaded", () => {
        console.log('DOM cargado, ejecutando definirUsuario...');
        definirUsuario();
    });


import {getInsumos, updateInsumo} from './services/InsumoService.js'
import { createTransaccion } from './services/TransaccionService.js';
import { registrarActividad } from './services/actividadUtilidad.js';


const form = document.querySelector('form');
const nombreInsumo = document.querySelector('select[name="nombre_insumo"]');
const areaSelect = document.querySelector('select[name="area"]');
const cantidad = document.querySelector('input[name="cantidad"]');
const nombreSolicitante = document.querySelector('input[name="nombre_solicitante"]');
const btnCancelar = document.querySelector('button[type="button"]');
const btnConfirmar = document.querySelector('button[type="submit"]');


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


for(let area of Areas){
    let option = document.createElement('option');
    option.innerHTML = area;
    areaSelect.appendChild(option);
}


let insumos = await getInsumos();
console.log(insumos)
for (let insumo of insumos){
    let option = document.createElement('option');
    option.innerText = insumo.nombre;
    nombreInsumo.appendChild(option);

}

let insumoSeleccionado = null;

nombreInsumo.addEventListener('change', () => {
    insumoSeleccionado = insumos.find(i => i.nombre == nombreInsumo.value);
    console.log(insumoSeleccionado);
    
    validarFormularioCompleto(); 
});

cantidad.addEventListener('change', () => {
    validarFormularioCompleto(); 
});

areaSelect.addEventListener('change', () => {
    validarFormularioCompleto(); 
});

function validarFormularioCompleto() {
    let formularioValido = true;
    let mensajes = [];
    
    const mensajeAnterior = document.querySelector('.mensaje-cantidad');
    if (mensajeAnterior) {
        mensajeAnterior.remove();
    }
    cantidad.style.outline = '';
    
    const areaValida = areaSelect.value !== "Seleccionar Area";
    if (!areaValida) {
        formularioValido = false;
    }
    
    const insumoValido = nombreInsumo.value !== "";
    if (!insumoValido) {
        formularioValido = false;
    }
    
    if (insumoSeleccionado && cantidad.value) {
        const cantidadSolicitada = Number(cantidad.value);
        if (cantidadSolicitada > insumoSeleccionado.stockActual) {
            formularioValido = false;
            
            const mensaje = document.createElement('span');
            mensaje.className = 'mensaje-cantidad block text-red-600 text-xs mt-1 font-medium';
            mensaje.innerText = "Stock insuficiente";
            cantidad.parentNode.appendChild(mensaje);
            cantidad.style.outline = '2px solid rgba(239, 68, 68, 0.5)';
        }
    }
    
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
    deshabilitarBoton(true); 
});


const usuarioActual = localStorage.getItem('usuarioActual');


form.addEventListener('submit', async function(e) {
    e.preventDefault(); 
    console.log(insumoSeleccionado.idInsumo)
    try {
        let transacción = {
            tipo: "egreso",
            fecha: new Date().toISOString().split('T')[0],
            cantidad: Number(cantidad.value), 
            areaDestino: areaSelect.value,
            solicitante: nombreSolicitante.value,
            idInsumo: insumoSeleccionado.idInsumo,
            idUsuario: usuarioActual
        };

        const cantidadSolicitada = Number(cantidad.value);
        insumoSeleccionado.stockActual -= cantidadSolicitada; 

        await updateInsumo(insumoSeleccionado.idInsumo,insumoSeleccionado);
        await createTransaccion(transacción);
        
        await registrarActividad(
            usuarioActual,
            "Egreso",
            `${nombreSolicitante.value} llevó ${insumoSeleccionado.nombre}`,
            areaSelect.value
        );
 
    } catch (error) {
        console.error('Error al procesar solicitud:', error);
        alert('Error al procesar la solicitud');
    }
});

