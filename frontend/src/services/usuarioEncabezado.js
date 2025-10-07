export function definirUsuario(){
    let rolActual = localStorage.getItem('rolActual');
    let encabezado = document.querySelector('header');
    let div = document.createElement('div');

    let i = rolActual == "Administrador"? 1:0;

    let img = ["imgs/logo-nodocente-encargado.svg","imgs/logo-admin.svg"]
    div.setAttribute("class","flex items-center gap-3 bg-[#C5DBA7] px-5 py-2.5 rounded-full");
    div.innerHTML = `
        <img src="${img[i]}" alt="${rolActual}" class="w-8 h-8 bg-[#8A9A7A] rounded-full flex items-center justify-center"/>
        <span class="font-bold text-lg">${rolActual}</span>
        <img src="imgs/icon-logout.svg"  onclick="window.location.href='index.html'"   class="cursor-pointer hover:scale-110 transition">

    `;
    
    // Agregar al header
    encabezado.appendChild(div);
}



      