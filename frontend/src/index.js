import { getUsuarioByMail } from "./services/UsuarioService";

document.querySelector('form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const usuario = document.querySelector('input[name="usuario"]').value;
  const password = document.querySelector('input[name="contraseña"]').value;

  console.log(password);
  try {
    const usuarioBD = await getUsuarioByMail(usuario);

    console.log('Usuario obtenido:', usuarioBD);

    if (usuarioBD.length > 0) {
      const usuarioData = usuarioBD[0];
      const rol = usuarioData.rol;
      const rolCapitalizado = rol.charAt(0).toUpperCase() + rol.slice(1);
      if (usuarioData.contrasena === password) {
        console.log(usuarioData.contrasena)
        console.log('Login exitoso');
        console.log(rolCapitalizado);

        const usuarioActual = usuarioData.idUsuario;
        console.log(usuarioActual);
        localStorage.setItem('usuarioActual',usuarioActual);
        
        localStorage.setItem('rolActual',rolCapitalizado);



        if(rol === "administrador"){
          window.location.href = "../administrador.html"
        }

        if(rol === "No Docente" || rol === "no docente"){
          window.location.href = "../notas-cargadas.html"
        }

        
        if(rol === "encargado"){
          window.location.href = "../encargado.html"
        }


      } else {
        console.log('Contraseña incorrecta');
      }
    } else {
      console.log('Usuario no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener usuario:', error);
  }
});

