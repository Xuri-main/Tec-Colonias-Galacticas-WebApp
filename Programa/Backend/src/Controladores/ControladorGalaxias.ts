/*
    Archivo: ControladorGalaxias.ts
    Descripcion: Atiende las solicitudes HTTP relacionadas con galaxias.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { Request, Response } from 'express';
import { ServicioGalaxias } from '../servicios/ServicioGalaxias';

export class ControladorGalaxias {
    private servicioGalaxias: ServicioGalaxias;

    /*
         constructor
        Entradas: Servicio de galaxias.
        Salidas: Nueva instancia de ControladorGalaxias.
        Objetivo: Inicializar el controlador con la logica de galaxias.
    */
    constructor(servicioGalaxias: ServicioGalaxias) {
        this.servicioGalaxias = servicioGalaxias;
    }

    /*
         listar
        Entradas: Solicitud y respuesta HTTP.
        Salidas: Respuesta JSON con galaxias.
        Objetivo: Enviar al cliente las galaxias disponibles.
    */
    public listar(_req: Request, res: Response): void {
        try {
            const galaxias = this.servicioGalaxias.listarGalaxias().map((galaxia) => galaxia.toJSON());
            res.json({ ok: true, galaxias });
        } catch (error: any) {
            res.status(500).json({ ok: false, mensaje: error.message });
        }
    }

    /*
         obtenerPorId
        Entradas: Solicitud con id de galaxia y respuesta HTTP.
        Salidas: Respuesta JSON con una galaxia.
        Objetivo: Enviar al cliente una galaxia especifica.
    */
    public obtenerPorId(req: Request, res: Response): void {
        try {
            const galaxia = this.servicioGalaxias.obtenerGalaxiaPorId((req.params.id as string));
            res.json({ ok: true, galaxia: galaxia.toJSON() });
        } catch (error: any) {
            res.status(404).json({ ok: false, mensaje: error.message });
        }
    }
}
