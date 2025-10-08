export function definirUsuario() {
  const rolActual = localStorage.getItem("rolActual");
  const encabezado = document.querySelector("header");

  const imgSrc =
    rolActual?.toLowerCase() === "administrador"
      ? "imgs/logo-admin.svg"
      : "imgs/logo-nodocente-encargado.svg";

  const div = document.createElement("div");
  div.className =
    "flex items-center gap-3 bg-[#C5DBA7] px-5 py-2.5 rounded-full";

  const botonAdmin =
    rolActual?.toLowerCase() === "administrador"
      ? `
        <button 
          onclick="window.location.href='administrador.html'"
          class="px-4 py-1.5 bg-[#4D3C2D] text-white text-sm font-semibold rounded-full hover:bg-[#3D3023] transition"
          title="Ir al panel de administración">
          Menú
        </button>`
      : "";

  div.innerHTML = `
    <img src="${imgSrc}" alt="${rolActual}" 
         class="w-8 h-8 bg-[#8A9A7A] rounded-full flex items-center justify-center"/>
    <span class="font-bold text-lg">${rolActual}</span>
    ${botonAdmin}
    <img src="imgs/icon-logout.svg" 
         alt="Cerrar sesión"
         title="Cerrar sesión"
         onclick="window.location.href='index.html'"   
         class="cursor-pointer hover:scale-110 transition w-6 h-6">
  `;

  encabezado.appendChild(div);
}
