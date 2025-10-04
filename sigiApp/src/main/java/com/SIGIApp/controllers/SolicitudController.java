package com.SIGIApp.controllers;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;
import com.SIGIApp.dao.SolicitudDao;
import com.SIGIApp.dto.Solicitud;
import com.SIGIApp.dto.SolicitudPk;
import com.SIGIApp.exceptions.SolicitudDaoException;
import com.SIGIApp.jdbc.SolicitudDaoImpl;


@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudController {
    private final SolicitudDao solicitudDao = new SolicitudDaoImpl();

    @GetMapping
    public List<Solicitud> getAll() throws SolicitudDaoException {
        return List.of(solicitudDao.findAll());
    }

    @GetMapping("/{id}")
    public Solicitud getById(@PathVariable int id) throws SolicitudDaoException {
        return solicitudDao.findByPrimaryKey(id);
    }

    @PostMapping
    public String create(@RequestBody Solicitud solicitud) throws SolicitudDaoException {
        solicitudDao.insert(solicitud);
        return "Solicitud creada";
    }

    @PutMapping("/{id}")
    public String update(@PathVariable int id, @RequestBody Solicitud solicitud) throws SolicitudDaoException {
        solicitud.setIdSolicitud(id);
        solicitudDao.update(new SolicitudPk(id), solicitud);
        return "Solicitud actualizada";
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable int id) throws SolicitudDaoException {
        solicitudDao.delete(new SolicitudPk(id));
        return "Solicitud eliminada";
    }


    @PutMapping("/{id}/estado")
    public String updateEstado(@PathVariable int id, @RequestBody Map<String,String> body) throws SolicitudDaoException {
        String nuevoEstado = body.get("estado");

        Solicitud solicitud = solicitudDao.findByPrimaryKey(id);
        if (solicitud == null) {
            throw new SolicitudDaoException("Solicitud no encontrada con id: " + id);
        }

        solicitud.setEstado(nuevoEstado);
        solicitudDao.update(new SolicitudPk(id), solicitud);

        return "Estado actualizado correctamente";
    }
}
