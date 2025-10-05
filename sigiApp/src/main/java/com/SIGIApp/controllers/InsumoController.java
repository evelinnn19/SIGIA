package com.SIGIApp.controllers;

import com.SIGIApp.dao.InsumoDao;
import com.SIGIApp.dto.Insumo;
import com.SIGIApp.dto.InsumoPk;
import com.SIGIApp.exceptions.InsumoDaoException;
import com.SIGIApp.jdbc.InsumoDaoImpl;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/insumos")
public class InsumoController {

    private final InsumoDao insumoDao = new InsumoDaoImpl();

    @GetMapping
    public List<Insumo> getAll() throws InsumoDaoException {
        return List.of(insumoDao.findAll());
    }

    @GetMapping("/{id}")
    public Insumo getById(@PathVariable int id) throws InsumoDaoException {
        return insumoDao.findByPrimaryKey(new InsumoPk(id));
    }

    @PostMapping
    public Map<String, String> create(@RequestBody Insumo insumo) throws InsumoDaoException {
        insumoDao.insert(insumo);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Insumo creado con éxito");
    return response;
    }

    @PutMapping("/{id}")
    public String update(@PathVariable int id, @RequestBody Insumo insumo) throws InsumoDaoException {
        insumo.setIdInsumo(id);
        insumoDao.update(new InsumoPk(id), insumo);
        return "Insumo actualizado con éxito";
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable int id) throws InsumoDaoException {
        insumoDao.delete(new InsumoPk(id));
        return "Insumo eliminado con éxito";
    }
}
