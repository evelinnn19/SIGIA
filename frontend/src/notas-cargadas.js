import { getUsuarioByMail } from "./services/UsuarioService";


document.querySelector('form').addEventListener('submit', function (e) {
  e.preventDefault();

  const usuario = document.querySelector('input[name="usuario"]').value;
  const password = document.querySelector('input[name="contraseña"]').value;
  
  const usuarioBD = getUsuarioByMail(usuario);
  console.log(usuarioBD);

  if (usuarioBD != null) {
    console.log("el mail existe")
    window.location.href = 'notas-cargadas.html';
  } else {
    alert('Por favor completa todos los campos');
  }
});