/*
    Archivo: aplicacion.ts
    Descripcion: Configura la aplicacion Express, sus servicios, controladores y rutas principales.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import cors from 'cors';
import express, { Request, Response } from 'express';
import { ControladorGalaxias } from './controladores/ControladorGalaxias';
import { ControladorPartidas } from './controladores/ControladorPartidas';
import { ControladorRanking } from './controladores/ControladorRanking';
import { RepositorioGalaxias } from './repositorios/RepositorioGalaxias';
import { RepositorioRanking } from './repositorios/RepositorioRanking';
import { crearRutasGalaxias } from './rutas/rutasGalaxias';
import { crearRutasPartidas } from './rutas/rutasPartidas';
import { crearRutasRanking } from './rutas/rutasRanking';
import { ServicioGalaxias } from './servicios/ServicioGalaxias';
import { ServicioPartidas } from './servicios/ServicioPartidas';
import { ServicioRanking } from './servicios/ServicioRanking';

const aplicacion = express();

aplicacion.use(cors());
aplicacion.use(express.json());

const repositorioGalaxias = new RepositorioGalaxias();
const repositorioRanking = new RepositorioRanking();
const servicioGalaxias = new ServicioGalaxias(repositorioGalaxias);
const servicioRanking = new ServicioRanking(repositorioRanking);
const servicioPartidas = new ServicioPartidas(servicioGalaxias, servicioRanking);

const controladorGalaxias = new ControladorGalaxias(servicioGalaxias);
const controladorPartidas = new ControladorPartidas(servicioPartidas);
const controladorRanking = new ControladorRanking(servicioRanking);

/*
     obtenerServicioPartidas
    Entradas: No recibe entradas.
    Salidas: Servicio de partidas.
    Objetivo: Compartir el servicio de partidas con la comunicacion por sockets.
*/
export function obtenerServicioPartidas(): ServicioPartidas {
    return servicioPartidas;
}

/*
     obtenerServicioRanking
    Entradas: No recibe entradas.
    Salidas: Servicio de ranking.
    Objetivo: Compartir el servicio de ranking cuando sea necesario.
*/
export function obtenerServicioRanking(): ServicioRanking {
    return servicioRanking;
}

/*
     responderHealth
    Entradas: Solicitud y respuesta HTTP.
    Salidas: Respuesta JSON con estado del servidor.
    Objetivo: Confirmar que el backend esta funcionando.
*/
function responderHealth(_req: Request, res: Response): void {
    res.json({ ok: true, mensaje: 'Backend de Colonias Galacticas funcionando.' });
}

aplicacion.get('/api/health', responderHealth);

aplicacion.use('/api/galaxias', crearRutasGalaxias(controladorGalaxias));
aplicacion.use('/api/partidas', crearRutasPartidas(controladorPartidas));
aplicacion.use('/api/ranking', crearRutasRanking(controladorRanking));

export default aplicacion;
