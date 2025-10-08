package com.SIGIApp.controllers;

import com.SIGIApp.dao.UsuarioDao;
import com.SIGIApp.dto.Usuario;
import com.SIGIApp.dto.UsuarioPk;
import com.SIGIApp.exceptions.UsuarioDaoException;
import com.SIGIApp.jdbc.UsuarioDaoImpl;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioDao usuarioDao = new UsuarioDaoImpl();


    @GetMapping
    public List<Usuario> getAll() throws UsuarioDaoException {
        return List.of(usuarioDao.findAll());
    }

    @GetMapping("/{id}")
    public Usuario getById(@PathVariable int id) throws UsuarioDaoException {
        return usuarioDao.findByPrimaryKey(id);
    }
    
    @PostMapping
    public ResponseEntity<Map<String, String>> create(@RequestBody Usuario usuario) throws UsuarioDaoException {
        usuarioDao.insert(usuario);

        Map<String, String> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Usuario creado con éxito");

        return ResponseEntity.ok(respuesta);
    }


    @PutMapping("/{id}")
    public String update(@PathVariable int id, @RequestBody Usuario usuario) throws UsuarioDaoException {
        usuario.setIdUsuario(id);
        usuarioDao.update(new UsuarioPk(id), usuario);
        return "Usuario actualizado con éxito";
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable int id) throws UsuarioDaoException {
        usuarioDao.delete(new UsuarioPk(id));
        return "Usuario eliminado con éxito";
    }


    @GetMapping("mail/{mail}")
    public Usuario[] getByMail(@PathVariable String mail) throws UsuarioDaoException {
        return usuarioDao.findWhereCorreoEquals(mail);
    }
}
