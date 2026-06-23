/*
    Archivo: tiposJuego.ts
    Descripcion: Tipos compartidos para representar datos usados por el frontend.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

export type VistaAplicacion = 'menu' | 'crear-partida' | 'unirse-partida' | 'ranking';

export type NivelRecursosIniciales = 'bajo' | 'normal' | 'alto';

export interface Recursos {
  minerales: number;
  energia: number;
  cristales: number;
}

export interface SistemaResumen {
  id: string;
  nombre: string;
  tipo?: string;
  descripcion?: string;
}

export interface RutaResumen {
  origenId?: string;
  destinoId?: string;
  origen?: string;
  destino?: string;
  distancia?: number;
}

export interface GalaxiaResumen {
  id: string;
  nombre: string;
  sistemas?: SistemaResumen[];
  rutas?: RutaResumen[];
  cantidadSistemas?: number;
  cantidadRutas?: number;
}

export interface PartidaResumen {
  id: string;
  nombre: string;
  galaxia?: string;
  nombreGalaxia?: string;
  jugadoresActuales: number;
  maxJugadores: number;
  estado: string;
}

export interface RankingItem {
  nombreGanador: string;
  sistemasControlados: number;
  recursosAcumulados: Recursos;
  galaxia: string;
  tiempoPartida: string;
  idPartida: string;
  puntaje?: number;
}

export interface RespuestaApi<T> {
  ok: boolean;
  mensaje?: string;
  data?: T;
  galaxias?: T;
  galaxia?: T;
  partidas?: T;
  partida?: T;
  ranking?: T;
}
