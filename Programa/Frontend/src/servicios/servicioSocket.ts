/*
    Archivo: servicioSocket.ts
    Descripcion: Administra la conexion WebSocket del frontend con el servidor del juego.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { io, Socket } from 'socket.io-client';
import { PartidaDetalle, PartidaResumen, TipoConstruccion } from '../tipos/tiposJuego';

const URL_SOCKET = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

let socketJuego: Socket | null = null;

type FuncionSinParametros = () => void;
type FuncionEstadoConexion = (conectado: boolean) => void;
type FuncionErrorJuego = (mensaje: string) => void;
type FuncionPartidas = (partidas: PartidaResumen[]) => void;
type FuncionPartida = (partida: PartidaDetalle) => void;
type FuncionCuentaRegresiva = (segundos: number) => void;

/*
     conectarSocket
    Entradas: No recibe entradas.
    Salidas: Socket conectado o en proceso de conexion.
    Objetivo: Crear una sola conexion WebSocket reutilizable para todo el frontend.
*/
export function conectarSocket(): Socket {
  if (!socketJuego) {
    socketJuego = io(URL_SOCKET, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1000
    });
  }

  if (!socketJuego.connected) {
    socketJuego.connect();
  }

  return socketJuego;
}

/*
     obtenerSocket
    Entradas: No recibe entradas.
    Salidas: Socket actual o valor nulo.
    Objetivo: Consultar la conexion existente sin crear una nueva.
*/
export function obtenerSocket(): Socket | null {
  return socketJuego;
}

/*
     obtenerIdSocket
    Entradas: No recibe entradas.
    Salidas: Identificador del socket o texto vacio.
    Objetivo: Conocer el identificador asignado por el servidor al cliente conectado.
*/
export function obtenerIdSocket(): string {
  return socketJuego?.id || '';
}

/*
     socketEstaConectado
    Entradas: No recibe entradas.
    Salidas: Verdadero si existe conexion activa.
    Objetivo: Validar si se pueden enviar eventos por WebSocket.
*/
export function socketEstaConectado(): boolean {
  return Boolean(socketJuego?.connected);
}

/*
     desconectarSocket
    Entradas: No recibe entradas.
    Salidas: No retorna valor.
    Objetivo: Cerrar manualmente la conexion WebSocket si fuera necesario.
*/
export function desconectarSocket(): void {
  if (socketJuego) {
    socketJuego.disconnect();
    socketJuego = null;
  }
}

/*
     escucharEstadoSocket
    Entradas: Funcion que recibe si el socket esta conectado.
    Salidas: Funcion para cancelar la escucha.
    Objetivo: Avisar a la interfaz cuando el socket se conecta o desconecta.
*/
export function escucharEstadoSocket(callback: FuncionEstadoConexion): FuncionSinParametros {
  const socket = conectarSocket();

  const conectado = () => callback(true);
  const desconectado = () => callback(false);

  socket.on('connect', conectado);
  socket.on('disconnect', desconectado);

  callback(socket.connected);

  return () => {
    socket.off('connect', conectado);
    socket.off('disconnect', desconectado);
  };
}

/*
     escucharErrorJuego
    Entradas: Funcion que recibe mensajes de error.
    Salidas: Funcion para cancelar la escucha.
    Objetivo: Mostrar errores enviados por el servidor WebSocket.
*/
export function escucharErrorJuego(callback: FuncionErrorJuego): FuncionSinParametros {
  const socket = conectarSocket();

  const manejarError = (datos: { mensaje?: string }) => {
    callback(datos.mensaje || 'El servidor reporto un error de juego.');
  };

  socket.on('error-juego', manejarError);

  return () => {
    socket.off('error-juego', manejarError);
  };
}

/*
     escucharPartidasActualizadas
    Entradas: Funcion que recibe la lista de partidas.
    Salidas: Funcion para cancelar la escucha.
    Objetivo: Actualizar en tiempo real la lista de salas disponibles.
*/
export function escucharPartidasActualizadas(callback: FuncionPartidas): FuncionSinParametros {
  const socket = conectarSocket();

  socket.on('partidas-actualizadas', callback);

  return () => {
    socket.off('partidas-actualizadas', callback);
  };
}

/*
     escucharPartidaActualizada
    Entradas: Funcion que recibe el estado actualizado de una partida.
    Salidas: Funcion para cancelar la escucha.
    Objetivo: Refrescar sala de espera o juego cuando el servidor emite cambios.
*/
export function escucharPartidaActualizada(callback: FuncionPartida): FuncionSinParametros {
  const socket = conectarSocket();

  socket.on('partida-actualizada', callback);

  return () => {
    socket.off('partida-actualizada', callback);
  };
}

/*
     escucharPartidaIniciada
    Entradas: Funcion que recibe una partida iniciada.
    Salidas: Funcion para cancelar la escucha.
    Objetivo: Avisar a todos los jugadores cuando la sala pasa al estado iniciado.
*/
export function escucharPartidaIniciada(callback: FuncionPartida): FuncionSinParametros {
  const socket = conectarSocket();

  socket.on('partida-iniciada', callback);

  return () => {
    socket.off('partida-iniciada', callback);
  };
}

/*
     escucharCuentaRegresiva
    Entradas: Funcion que recibe segundos restantes.
    Salidas: Funcion para cancelar la escucha.
    Objetivo: Mostrar la cuenta regresiva enviada por el servidor antes de iniciar la partida.
*/
export function escucharCuentaRegresiva(callback: FuncionCuentaRegresiva): FuncionSinParametros {
  const socket = conectarSocket();

  const manejarCuenta = (datos: { segundos?: number }) => {
    callback(Number(datos.segundos || 0));
  };

  socket.on('cuenta-regresiva', manejarCuenta);

  return () => {
    socket.off('cuenta-regresiva', manejarCuenta);
  };
}

/*
     pedirPartidasActualizadas
    Entradas: No recibe entradas.
    Salidas: No retorna valor.
    Objetivo: Solicitar al backend la lista actual de partidas por WebSocket.
*/
export function pedirPartidasActualizadas(): void {
  conectarSocket().emit('unirse-sala-partidas');
}

/*
     entrarSalaPartidaSocket
    Entradas: Identificador de partida.
    Salidas: No retorna valor.
    Objetivo: Registrar este cliente dentro del canal WebSocket de una partida.
*/
export function entrarSalaPartidaSocket(idPartida: string): void {
  if (!idPartida.trim()) {
    return;
  }

  conectarSocket().emit('entrar-partida', { idPartida });
}

/*
     unirsePartidaSocket
    Entradas: Identificador de partida y nickname.
    Salidas: No retorna valor.
    Objetivo: Solicitar ingreso a una sala usando WebSocket.
*/
export function unirsePartidaSocket(idPartida: string, nickname: string): void {
  conectarSocket().emit('unirse-partida', { idPartida, nickname });
}

/*
     iniciarPartidaSocket
    Entradas: Identificador de partida.
    Salidas: No retorna valor.
    Objetivo: Enviar la orden de inicio de partida por WebSocket.
*/
export function iniciarPartidaSocket(idPartida: string): void {
  conectarSocket().emit('iniciar-partida', { idPartida });
}

/*
     construirSocket
    Entradas: Partida, jugador, sistema y tipo de construccion.
    Salidas: No retorna valor.
    Objetivo: Enviar una orden de construccion para sincronizar a todos los clientes.
*/
export function construirSocket(idPartida: string, jugadorId: string, sistemaId: string, tipoConstruccion: TipoConstruccion): void {
  conectarSocket().emit('construir', { idPartida, jugadorId, sistemaId, tipoConstruccion });
}

/*
     moverFlotasSocket
    Entradas: Partida, jugador, origen, destino y cantidad.
    Salidas: No retorna valor.
    Objetivo: Enviar una orden de movimiento de flotas por WebSocket.
*/
export function moverFlotasSocket(idPartida: string, jugadorId: string, origenId: string, destinoId: string, cantidad: number): void {
  conectarSocket().emit('mover-flotas', { idPartida, jugadorId, origenId, destinoId, cantidad });
}
