/*
    Archivo: rutasRanking.ts
    Descripcion: Define las rutas HTTP para consultar el ranking historico.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { Router } from 'express';
import { ControladorRanking } from '../controladores/ControladorRanking';

/*
     crearRutasRanking
    Entradas: Controlador de ranking.
    Salidas: Router configurado.
    Objetivo: Crear las rutas relacionadas con ranking.
*/
export function crearRutasRanking(controlador: ControladorRanking): Router {
    const rutas = Router();

    rutas.get('/', controlador.listar.bind(controlador));

    return rutas;
}
