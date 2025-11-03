/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.SIGIApp.util;

/**
 *
 * @author Evelin
 */

import java.util.regex.Pattern;

public class Validador {

    // ---------- STRING ----------
    public static void validarString(String valor, String campo, int min, int max) {
        if (valor == null)
            throw new IllegalArgumentException("El campo '" + campo + "' no puede ser nulo.");
        if (valor.trim().isEmpty())
            throw new IllegalArgumentException("El campo '" + campo + "' no puede estar vacío.");
        if (valor.length() < min)
            throw new IllegalArgumentException("El campo '" + campo + "' debe tener al menos " + min + " caracteres.");
        if (valor.length() > max)
            throw new IllegalArgumentException("El campo '" + campo + "' debe tener como máximo " + max + " caracteres.");
    }

    // ---------- STOCK / CANTIDAD ----------
    public static void validarCantidad(Integer cantidad, String campo) {
        if (cantidad == null)
            throw new IllegalArgumentException("El campo '" + campo + "' no puede ser nulo.");
        if (cantidad < 0)
            throw new IllegalArgumentException("El campo '" + campo + "' no puede ser negativo.");
    }

    // ---------- EMAIL ----------
    public static void validarEmail(String email) {
        if (email == null)
            throw new IllegalArgumentException("El email no puede ser nulo.");

        String regex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        if (!Pattern.matches(regex, email))
            throw new IllegalArgumentException("El email no tiene un formato válido.");
    }

    // ---------- PASSWORD ----------
    public static void validarPassword(String pass) {
        if (pass == null)
            throw new IllegalArgumentException("La contraseña no puede ser nula.");

        if (pass.length() < 8 || pass.length() > 50)
            throw new IllegalArgumentException("La contraseña debe tener entre 8 y 50 caracteres.");

        if (!pass.matches(".*[A-Z].*"))
            throw new IllegalArgumentException("Debe contener al menos una letra mayúscula.");

        if (!pass.matches(".*[a-z].*"))
            throw new IllegalArgumentException("Debe contener al menos una letra minúscula.");

        if (!pass.matches(".*\\d.*"))
            throw new IllegalArgumentException("Debe contener al menos un número.");

        if (!pass.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*"))
            throw new IllegalArgumentException("Debe contener al menos un símbolo especial.");
    }
}
