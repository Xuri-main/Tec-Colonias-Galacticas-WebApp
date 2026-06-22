/*
    Archivo: servicioGalaxias.ts
    Descripcion: Funciones para consultar galaxias disponibles en el backend.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { GalaxiaResumen, RespuestaApi } from '../tipos/tiposJuego';
import { solicitar } from './clienteApi';

/*
     obtenerGalaxias
    Entradas: No recibe entradas.
    Salidas: Lista de galaxias disponibles.
    Objetivo: Obtener las galaxias cargadas desde archivos JSON en el backend.
*/
export async function obtenerGalaxias(): Promise<GalaxiaResumen[]> {
  const respuesta = await solicitar<RespuestaApi<GalaxiaResumen[]>>('/galaxias');
  return respuesta.galaxias || [];
}
