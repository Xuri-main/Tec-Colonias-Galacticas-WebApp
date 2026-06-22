/*
    Archivo: ControladorRanking.ts
    Descripcion: Atiende las solicitudes HTTP relacionadas con el ranking historico.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { Request, Response } from 'express';
import { ServicioRanking } from '../servicios/ServicioRanking';

export class ControladorRanking {
    private servicioRanking: ServicioRanking;

    /*
         constructor
        Entradas: Servicio de ranking.
        Salidas: Nueva instancia de ControladorRanking.
        Objetivo: Inicializar el controlador con la logica de ranking.
    */
    constructor(servicioRanking: ServicioRanking) {
        this.servicioRanking = servicioRanking;
    }

    /*
         listar
        Entradas: Solicitud y respuesta HTTP.
        Salidas: Respuesta JSON con ranking.
        Objetivo: Enviar al cliente el ranking historico de partidas.
    */
    public listar(_req: Request, res: Response): void {
        try {
            res.json({ ok: true, ranking: this.servicioRanking.listarRanking() });
        } catch (error: any) {
            res.status(500).json({ ok: false, mensaje: error.message });
        }
    }
}
