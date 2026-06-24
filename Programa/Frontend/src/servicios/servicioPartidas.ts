/*
    Archivo: servicioPartidas.ts
    Descripcion: Funciones para crear, consultar y unirse a partidas.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { NivelRecursosIniciales, PartidaDetalle, PartidaResumen, RespuestaApi, TipoConstruccion } from '../tipos/tiposJuego';
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
export async function unirsePartida(idPartida: string, nickname: string, idSocket = ''): Promise<PartidaDetalle> {
  const respuesta = await solicitar<RespuestaApi<PartidaDetalle>>(`/partidas/${idPartida}/unirse`, {
    method: 'POST',
    body: JSON.stringify({ nickname, idSocket })
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


/*
     construirEnPartida
    Entradas: Identificador de partida, jugador, sistema y tipo de construccion.
    Salidas: Partida actualizada.
    Objetivo: Solicitar al backend la construccion de una instalacion.
*/
export async function construirEnPartida(idPartida: string, jugadorId: string, sistemaId: string, tipoConstruccion: TipoConstruccion): Promise<PartidaDetalle> {
  const respuesta = await solicitar<RespuestaApi<PartidaDetalle>>(`/partidas/${idPartida}/construir`, {
    method: 'POST',
    body: JSON.stringify({ jugadorId, sistemaId, tipoConstruccion })
  });

  return respuesta.partida as PartidaDetalle;
}

/*
     moverFlotasEnPartida
    Entradas: Identificador de partida, jugador, origen, destino y cantidad.
    Salidas: Partida actualizada.
    Objetivo: Solicitar al backend el movimiento de flotas y posible conquista.
*/
export async function moverFlotasEnPartida(idPartida: string, jugadorId: string, origenId: string, destinoId: string, cantidad: number): Promise<PartidaDetalle> {
  const respuesta = await solicitar<RespuestaApi<PartidaDetalle>>(`/partidas/${idPartida}/mover-flotas`, {
    method: 'POST',
    body: JSON.stringify({ jugadorId, origenId, destinoId, cantidad })
  });

  return respuesta.partida as PartidaDetalle;
}

/*
     finalizarPartida
    Entradas: Identificador de partida y razon opcional.
    Salidas: Partida finalizada.
    Objetivo: Solicitar al backend la finalizacion de una partida para calcular estadisticas y ranking.
*/
export async function finalizarPartida(idPartida: string, razon: string): Promise<PartidaDetalle> {
  const respuesta = await solicitar<RespuestaApi<PartidaDetalle>>(`/partidas/${idPartida}/finalizar`, {
    method: 'POST',
    body: JSON.stringify({ razon })
  });

  return respuesta.partida as PartidaDetalle;
}
