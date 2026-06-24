/*
    Archivo: servicioPartidas.ts
    Descripcion: Funciones para crear, consultar y unirse a partidas.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { NivelRecursosIniciales, PartidaDetalle, PartidaResumen, RespuestaApi } from '../tipos/tiposJuego';
import { solicitar } from './clienteApi';

export interface DatosCrearPartida {
  nombre: string;
  idGalaxia: string;
  maxJugadores: number;
  tiempoMaximoMinutos: number;
  nivelRecursosIniciales: NivelRecursosIniciales;
}

/*
     obtenerPartidas
    Entradas: No recibe entradas.
    Salidas: Lista de partidas existentes.
    Objetivo: Consultar las partidas disponibles en el servidor.
*/
export async function obtenerPartidas(): Promise<PartidaResumen[]> {
  const respuesta = await solicitar<RespuestaApi<PartidaResumen[]>>('/partidas');
  return respuesta.partidas || [];
}

/*
     crearPartida
    Entradas: Datos necesarios para configurar una partida.
    Salidas: Partida creada por el backend.
    Objetivo: Enviar al servidor la configuracion de una nueva partida.
*/
export async function crearPartida(datos: DatosCrearPartida): Promise<PartidaDetalle> {
  const respuesta = await solicitar<RespuestaApi<PartidaDetalle>>('/partidas', {
    method: 'POST',
    body: JSON.stringify(datos)
  });

  return respuesta.partida as PartidaDetalle;
}

/*
     obtenerPartidaPorId
    Entradas: Identificador de la partida.
    Salidas: Estado publico completo de la partida.
    Objetivo: Consultar una partida concreta para mostrar sus datos actuales.
*/
export async function obtenerPartidaPorId(idPartida: string): Promise<PartidaDetalle> {
  const respuesta = await solicitar<RespuestaApi<PartidaDetalle>>(`/partidas/${idPartida}`);
  return respuesta.partida as PartidaDetalle;
}

/*
     unirsePartida
    Entradas: Identificador de partida y nickname del jugador.
    Salidas: Partida actualizada.
    Objetivo: Incorporar un jugador a una partida existente.
*/
export async function unirsePartida(idPartida: string, nickname: string): Promise<PartidaDetalle> {
  const respuesta = await solicitar<RespuestaApi<PartidaDetalle>>(`/partidas/${idPartida}/unirse`, {
    method: 'POST',
    body: JSON.stringify({ nickname })
  });

  return respuesta.partida as PartidaDetalle;
}

/*
     iniciarPartida
    Entradas: Identificador de partida.
    Salidas: Partida iniciada.
    Objetivo: Solicitar al backend el inicio de una partida llena o valida.
*/
export async function iniciarPartida(idPartida: string): Promise<PartidaDetalle> {
  const respuesta = await solicitar<RespuestaApi<PartidaDetalle>>(`/partidas/${idPartida}/iniciar`, {
    method: 'POST'
  });

  return respuesta.partida as PartidaDetalle;
}
