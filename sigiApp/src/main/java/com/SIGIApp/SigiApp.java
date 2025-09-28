/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 */

package com.SIGIApp;
import Userinterface.*;
/**
 *
 * @author Anita
 */
public class SigiApp {

    public static void main(String[] args) {
        System.out.println("Hello World!");
        //Marcar a PantallaBienvenida cómo pantalla principal luego.
        SolicitarInsumo soli = new SolicitarInsumo(1);
        soli.setVisible(true);
    }
}
