/*
    Archivo: ControladorPartidas.ts
    Descripcion: Atiende las solicitudes HTTP relacionadas con partidas.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { Request, Response } from 'express';
import { ServicioPartidas } from '../servicios/ServicioPartidas';

export class ControladorPartidas {
    private servicioPartidas: ServicioPartidas;

    /*
         constructor
        Entradas: Servicio de partidas.
        Salidas: Nueva instancia de ControladorPartidas.
        Objetivo: Inicializar el controlador con la logica de partidas.
    */
    constructor(servicioPartidas: ServicioPartidas) {
        this.servicioPartidas = servicioPartidas;
    }

    /*
         listar
        Entradas: Solicitud y respuesta HTTP.
        Salidas: Respuesta JSON con partidas.
        Objetivo: Enviar al cliente las partidas existentes.
    */
    public listar(_req: Request, res: Response): void {
        try {
            res.json({ ok: true, partidas: this.servicioPartidas.listarPartidas() });
        } catch (error: any) {
            res.status(500).json({ ok: false, mensaje: error.message });
        }
    }

    /*
         crear
        Entradas: Solicitud con datos de partida y respuesta HTTP.
        Salidas: Respuesta JSON con la partida creada.
        Objetivo: Crear una nueva partida desde el cliente.
    */
    public crear(req: Request, res: Response): void {
        try {
            const { nombre, idGalaxia, maxJugadores, tiempoMaximoMinutos, nivelRecursosIniciales } = req.body;
            const partida = this.servicioPartidas.crearPartida(nombre, idGalaxia, Number(maxJugadores), Number(tiempoMaximoMinutos), nivelRecursosIniciales);
            res.status(201).json({ ok: true, partida: partida.obtenerEstadoPublico() });
        } catch (error: any) {
            res.status(400).json({ ok: false, mensaje: error.message });
        }
    }

    /*
         obtenerPorId
        Entradas: Solicitud con id de partida y respuesta HTTP.
        Salidas: Respuesta JSON con una partida.
        Objetivo: Consultar el estado completo de una partida.
    */
    public obtenerPorId(req: Request, res: Response): void {
        try {
            const partida = this.servicioPartidas.obtenerPartida((req.params.id as string));
            res.json({ ok: true, partida: partida.obtenerEstadoPublico() });
        } catch (error: any) {
            res.status(404).json({ ok: false, mensaje: error.message });
        }
    }

    /*
         unirse
        Entradas: Solicitud con nickname y respuesta HTTP.
        Salidas: Respuesta JSON con partida actualizada.
        Objetivo: Agregar un jugador a una partida en espera.
    */
    public unirse(req: Request, res: Response): void {
        try {
            const { idSocket, nickname } = req.body;
            const partida = this.servicioPartidas.unirJugador((req.params.id as string), idSocket || 'sin-socket', nickname);
            res.json({ ok: true, partida });
        } catch (error: any) {
            res.status(400).json({ ok: false, mensaje: error.message });
        }
    }

    /*
         iniciar
        Entradas: Solicitud con id de partida y respuesta HTTP.
        Salidas: Respuesta JSON con partida iniciada.
        Objetivo: Iniciar una partida desde la sala de espera.
    */
    public iniciar(req: Request, res: Response): void {
        try {
            const partida = this.servicioPartidas.iniciarPartida((req.params.id as string));
            res.json({ ok: true, partida });
        } catch (error: any) {
            res.status(400).json({ ok: false, mensaje: error.message });
        }
    }

    /*
         construir
        Entradas: Solicitud con jugador, sistema y construccion.
        Salidas: Respuesta JSON con partida actualizada.
        Objetivo: Crear una instalacion en un sistema controlado.
    */
    public construir(req: Request, res: Response): void {
        try {
            const { jugadorId, sistemaId, tipoConstruccion } = req.body;
            const partida = this.servicioPartidas.construir((req.params.id as string), jugadorId, sistemaId, tipoConstruccion);
            res.json({ ok: true, partida });
        } catch (error: any) {
            res.status(400).json({ ok: false, mensaje: error.message });
        }
    }

    /*
         moverFlotas
        Entradas: Solicitud con jugador, origen, destino y cantidad.
        Salidas: Respuesta JSON con partida actualizada.
        Objetivo: Mover flotas entre sistemas conectados.
    */
    public moverFlotas(req: Request, res: Response): void {
        try {
            const { jugadorId, origenId, destinoId, cantidad } = req.body;
            const partida = this.servicioPartidas.moverFlotas((req.params.id as string), jugadorId, origenId, destinoId, Number(cantidad));
            res.json({ ok: true, partida });
        } catch (error: any) {
            res.status(400).json({ ok: false, mensaje: error.message });
        }
    }
}
