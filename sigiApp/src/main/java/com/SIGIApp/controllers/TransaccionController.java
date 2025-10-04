package com.SIGIApp.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import com.SIGIApp.dao.TransaccionDao;
import com.SIGIApp.dto.Transaccion;
import com.SIGIApp.dto.TransaccionPk;
import com.SIGIApp.exceptions.TransaccionDaoException;
import com.SIGIApp.jdbc.TransaccionDaoImpl;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/transacciones")
public class TransaccionController {
    private final TransaccionDao transaccionDao = new TransaccionDaoImpl();

    
    @GetMapping
    public List<Transaccion> getAll() throws TransaccionDaoException {
        return List.of(transaccionDao.findAll());
    }

    @GetMapping("/{id}")
    public Transaccion getById(@PathVariable int id) throws TransaccionDaoException {
        return transaccionDao.findByPrimaryKey(id);
    }

    @PostMapping
    public String create(@RequestBody Transaccion transaccion) throws TransaccionDaoException {
        transaccionDao.insert(transaccion);
        return "Transacción creada";
    }

    @PutMapping("/{id}")
    public String update(@PathVariable int id, @RequestBody Transaccion transaccion) throws TransaccionDaoException {
        transaccion.setIdTransaccion(id);
        transaccionDao.update(new TransaccionPk(id), transaccion);
        return "Transacción actualizada";
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable int id) throws TransaccionDaoException {
        transaccionDao.delete(new TransaccionPk(id));
        return "Transacción eliminada";
    }
}
