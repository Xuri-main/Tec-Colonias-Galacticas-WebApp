/*
    Archivo: servicioRanking.ts
    Descripcion: Funciones para consultar el ranking historico de partidas.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { RankingItem, RespuestaApi } from '../tipos/tiposJuego';
import { solicitar } from './clienteApi';

/*
     obtenerRanking
    Entradas: No recibe entradas.
    Salidas: Lista de registros del ranking.
    Objetivo: Obtener los ganadores historicos registrados por el backend.
*/
export async function obtenerRanking(): Promise<RankingItem[]> {
  const respuesta = await solicitar<RespuestaApi<RankingItem[]>>('/ranking');
  return respuesta.ranking || [];
}
