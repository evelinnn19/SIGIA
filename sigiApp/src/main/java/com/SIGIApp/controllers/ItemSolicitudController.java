package com.SIGIApp.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import com.SIGIApp.dao.ItemSolicitudDao;
import com.SIGIApp.dto.ItemSolicitud;
import com.SIGIApp.dto.ItemSolicitudPk;
import com.SIGIApp.exceptions.ItemSolicitudDaoException;
import com.SIGIApp.jdbc.ItemSolicitudDaoImpl;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/item-solicitudes")
public class ItemSolicitudController {
    private final ItemSolicitudDao itemSolicitudDao = new ItemSolicitudDaoImpl();

    @GetMapping
    public List<ItemSolicitud> getAll() throws ItemSolicitudDaoException {
        return List.of(itemSolicitudDao.findAll());
    }

    @GetMapping("/{id}")
    public ItemSolicitud getById(@PathVariable int id) throws ItemSolicitudDaoException {
        return itemSolicitudDao.findByPrimaryKey(id);
    }

    @PostMapping
    public String create(@RequestBody ItemSolicitud item) throws ItemSolicitudDaoException {
        itemSolicitudDao.insert(item);
        return "Item de solicitud creado";
    }

    @PutMapping("/{id}")
    public String update(@PathVariable int id, @RequestBody ItemSolicitud item) throws ItemSolicitudDaoException {
        item.setIdItem(id);
        itemSolicitudDao.update(new ItemSolicitudPk(id), item);
        return "Item de solicitud actualizado";
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable int id) throws ItemSolicitudDaoException {
        itemSolicitudDao.delete(new ItemSolicitudPk(id));
        return "Item de solicitud eliminado";
    }
}
