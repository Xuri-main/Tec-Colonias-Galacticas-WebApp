/*
    Archivo: rutasGalaxias.ts
    Descripcion: Define las rutas HTTP para consultar galaxias.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { Router } from 'express';
import { ControladorGalaxias } from '../controladores/ControladorGalaxias';

/*
     crearRutasGalaxias
    Entradas: Controlador de galaxias.
    Salidas: Router configurado.
    Objetivo: Crear las rutas relacionadas con galaxias.
*/
export function crearRutasGalaxias(controlador: ControladorGalaxias): Router {
    const rutas = Router();

    rutas.get('/', controlador.listar.bind(controlador));
    rutas.get('/:id', controlador.obtenerPorId.bind(controlador));

    return rutas;
}
