/*
    Archivo: rutasPartidas.ts
    Descripcion: Define las rutas HTTP para administrar partidas.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { Router } from 'express';
import { ControladorPartidas } from '../controladores/ControladorPartidas';

/*
     crearRutasPartidas
    Entradas: Controlador de partidas.
    Salidas: Router configurado.
    Objetivo: Crear las rutas relacionadas con partidas.
*/
export function crearRutasPartidas(controlador: ControladorPartidas): Router {
    const rutas = Router();

    rutas.get('/', controlador.listar.bind(controlador));
    rutas.post('/', controlador.crear.bind(controlador));
    rutas.get('/:id', controlador.obtenerPorId.bind(controlador));
    rutas.post('/:id/unirse', controlador.unirse.bind(controlador));
    rutas.post('/:id/iniciar', controlador.iniciar.bind(controlador));
    rutas.post('/:id/construir', controlador.construir.bind(controlador));
    rutas.post('/:id/mover-flotas', controlador.moverFlotas.bind(controlador));
    rutas.post('/:id/finalizar', controlador.finalizar.bind(controlador));

    return rutas;
}
