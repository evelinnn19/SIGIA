package com.SIGIApp.controllers;

import com.SIGIApp.dao.ActividadDao;
import com.SIGIApp.dto.Actividad;
import com.SIGIApp.dto.ActividadPk;
import com.SIGIApp.exceptions.ActividadDaoException;
import com.SIGIApp.jdbc.ActividadDaoImpl;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/actividades")
public class ActividadController {
    private final ActividadDao actividadDao = new ActividadDaoImpl();

    @GetMapping
    public List<Actividad> getAll() throws ActividadDaoException {
        return List.of(actividadDao.findAll());
    }

    @GetMapping("/{id}")
    public Actividad getById(@PathVariable int id) throws ActividadDaoException {
        return actividadDao.findByPrimaryKey(id);
    }

    @PostMapping
    public String create(@RequestBody Actividad actividad) throws ActividadDaoException {
        actividadDao.insert(actividad);
        return "Actividad creada";
    }

    @PutMapping("/{id}")
    public String update(@PathVariable int id, @RequestBody Actividad actividad) throws ActividadDaoException {
        actividad.setIdActividad(id);
        actividadDao.update(new ActividadPk(id), actividad);
        return "Actividad actualizada";
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable int id) throws ActividadDaoException {
        actividadDao.delete(new ActividadPk(id));
        return "Actividad eliminada";
    }
}
