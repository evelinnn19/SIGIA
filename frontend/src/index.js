 document.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const usuario = document.querySelector('input[name="usuario"]').value;
        const password = document.querySelector('input[name="contraseña"]').value;
        
        if (usuario && password) {
          window.location.href = 'notas-cargadas.html';
        } else {
          alert('Por favor completa todos los campos');
        }
      });
