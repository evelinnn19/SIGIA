/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package util;

import com.SIGIApp.util.Validador;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 *
 * @author Evelin
 */

class ValidadorTest {
   // STRING
    @Test
    @DisplayName("Debería lanzar excepción si el string es nulo o vacío")
    void testStringInvalido() {
        assertThrows(IllegalArgumentException.class,
                () -> Validador.validarString(null, "nombre", 3, 50));
        assertThrows(IllegalArgumentException.class,
                () -> Validador.validarString("", "nombre", 3, 50));
    }

    @Test
    @DisplayName("Debería aceptar un string válido")
    void testStringValido() {
        assertDoesNotThrow(() -> Validador.validarString("Tornillos", "nombre", 3, 50));
    }

    // STOCK
    @Test
    @DisplayName("Debería lanzar excepción si el stock es nulo o negativo")
    void testStockInvalido() {
        assertThrows(IllegalArgumentException.class,
                () -> Validador.validarCantidad(null, "stock"));
        assertThrows(IllegalArgumentException.class,
                () -> Validador.validarCantidad(-5, "stock"));
    }

    @Test
    @DisplayName("Debería aceptar stock válido")
    void testStockValido() {
        assertDoesNotThrow(() -> Validador.validarCantidad(10, "stock"));
    }

    // EMAIL
    @Test
    @DisplayName("Debería lanzar excepción si el email es inválido")
    void testEmailInvalido() {
        assertThrows(IllegalArgumentException.class,
                () -> Validador.validarEmail("correo@@dominio"));
        assertThrows(IllegalArgumentException.class,
                () -> Validador.validarEmail("sin-arroba.com"));
    }

    @Test
    @DisplayName("Debería aceptar email válido")
    void testEmailValido() {
        assertDoesNotThrow(() -> Validador.validarEmail("usuario@mail.com"));
    }

    // PASSWORD
    @Test
    @DisplayName("Debería lanzar excepción si la contraseña no cumple requisitos")
    void testPasswordInvalida() {
        assertThrows(IllegalArgumentException.class,
                () -> Validador.validarPassword("abcdef1!")); // sin mayúscula
        assertThrows(IllegalArgumentException.class,
                () -> Validador.validarPassword("ABCDEF1!")); // sin minúscula
        assertThrows(IllegalArgumentException.class,
                () -> Validador.validarPassword("Abcdefgh")); // sin número ni símbolo
    }

    @Test
    @DisplayName("Debería aceptar una contraseña válida")
    void testPasswordValida() {
        assertDoesNotThrow(() -> Validador.validarPassword("Abcdef1!"));
    }
}
