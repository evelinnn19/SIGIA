package com.SIGIApp.controllers;

import com.SIGIApp.dao.CategoriaDao;
import com.SIGIApp.dto.Categoria;
import com.SIGIApp.dto.CategoriaPk;
import com.SIGIApp.exceptions.CategoriaDaoException;
import com.SIGIApp.jdbc.CategoriaDaoImpl;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    // Instancia de la implementación DAO generada por FireStorm
    private final CategoriaDao categoriaDao = new CategoriaDaoImpl();

    @GetMapping
    public List<Categoria> getAll() throws CategoriaDaoException {
        // El método findAll() en FireStorm retorna un array[], lo convertimos a List para Spring Boot
        return List.of(categoriaDao.findAll());
    }

    @GetMapping("/{id}")
    public Categoria getById(@PathVariable int id) throws CategoriaDaoException {
        // Busca por la clave primaria (idCategoria)
        return categoriaDao.findByPrimaryKey(id);
    }
    
@PostMapping
public ResponseEntity<Map<String, String>> create(@RequestBody Categoria categoria) {
    Map<String, String> respuesta = new HashMap<>();
    try {
        categoriaDao.insert(categoria);
        respuesta.put("mensaje", "Categoría creada con éxito");
        return ResponseEntity.ok(respuesta);
    } catch (CategoriaDaoException e) {
        // Verifica si el error se debe a una violación de clave única
        String msg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
        if (msg.contains("duplicate") || msg.contains("unique") || msg.contains("constraint")) {
            respuesta.put("mensaje", "La categoría ya existe");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(respuesta); // 409
        }

        respuesta.put("mensaje", "Error interno al crear categoría");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(respuesta);
    }
}



    @PutMapping("/{id}")
    public String update(@PathVariable int id, @RequestBody Categoria categoria) throws CategoriaDaoException {
        // Configura el ID de la categoría a actualizar
        categoria.setIdCategoria(id);
        
        // El método update de FireStorm requiere el PK original y el nuevo DTO
        categoriaDao.update(new CategoriaPk(id), categoria);
        
        return "Categoría actualizada con éxito";
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable int id) throws CategoriaDaoException {
        // Elimina la categoría usando su clave primaria (CategoriaPk)
        categoriaDao.delete(new CategoriaPk(id));
        return "Categoría eliminada con éxito";
    }

    // Método adicional basado en tu campo 'nombre' (similar a findWhereCorreoEquals)
    @GetMapping("/nombre/{nombre}")
    public Categoria[] getByNombre(@PathVariable String nombre) throws CategoriaDaoException {
        // Asume que FireStorm generó automáticamente un método findWhereNombreEquals
        return categoriaDao.findWhereNombreEquals(nombre);
    }
}