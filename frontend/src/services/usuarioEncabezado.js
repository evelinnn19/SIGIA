export function definirUsuario() {
    const rolActual = localStorage.getItem('rolActual');
    
    if (!rolActual) {
        console.warn('No se encontró rol en localStorage');
        return;
    }
    
    const encabezado = document.querySelector('header');
    
    if (!encabezado) {
        console.warn('No se encontró el elemento header');
        return;
    }
    
    // Verificar si ya existe el div del usuario (para evitar duplicados)
    const existingDiv = encabezado.querySelector('.user-role-div');
    if (existingDiv) {
        existingDiv.remove();
    }
    
    const div = document.createElement('div');
    div.className = "flex items-center gap-3 bg-[#C5DBA7] px-5 py-2.5 rounded-full user-role-div";
    div.innerHTML = `
        <img src="imgs/logo-nodocente-encargado.svg" alt="${rolActual}" class="w-8 h-8 rounded-full"/>
        <span class="font-bold text-lg text-[#4D3C2D]">${rolActual}</span>
    `;
    
    encabezado.appendChild(div);
}