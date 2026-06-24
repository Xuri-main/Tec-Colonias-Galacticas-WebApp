/*
    Archivo: tiposJuego.ts
    Descripcion: Tipos compartidos para representar datos usados por el frontend.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

export type VistaAplicacion = 'menu' | 'crear-partida' | 'unirse-partida' | 'sala-espera' | 'juego' | 'ranking';

export type NivelRecursosIniciales = 'bajo' | 'normal' | 'alto';

export type TipoConstruccion = 'mina' | 'centroInvestigacion' | 'astillero' | 'fortaleza';

export interface Recursos {
  minerales: number;
  energia: number;
  cristales: number;
}

export interface Instalaciones {
  minas: number;
  centrosInvestigacion: number;
  astilleros: number;
  fortalezas: number;
}

export interface SistemaResumen {
  id: string;
  nombre: string;
  tipo?: string;
  descripcion?: string;
  propietarioId?: string | null;
  flotas?: number;
  instalaciones?: Instalaciones;
  estadoExploracion?: string;
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

export interface JugadorResumen {
  id: string;
  nickname: string;
  recursos?: Recursos;
  planetaBaseId?: string | null;
  eliminado?: boolean;
}

export interface PartidaResumen {
  id: string;
  nombre: string;
  galaxia?: string | GalaxiaResumen;
  nombreGalaxia?: string;
  jugadoresActuales: number;
  maxJugadores: number;
  estado: string;
}

export interface PartidaDetalle extends PartidaResumen {
  jugadores?: JugadorResumen[];
  tiempoMaximoMinutos?: number;
  fechaCreacion?: string;
  fechaInicio?: string | null;
  fechaFinalizacion?: string | null;
  eventos?: string[];
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
