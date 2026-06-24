/*
    Archivo: tiposJuego.ts
    Descripcion: Define los tipos de datos principales utilizados por el juego.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

export type TipoPlaneta = 'minero' | 'energetico' | 'cientifico' | 'balanceado';
export type EstadoExploracion = 'noExplorado' | 'controlado';
export type EstadoPartida = 'esperando' | 'iniciada' | 'finalizada' | 'cerrada';
export type NivelRecursosIniciales = 'bajo' | 'normal' | 'alto';
export type TipoConstruccion = 'mina' | 'centroInvestigacion' | 'astillero' | 'fortaleza';

export interface DatosSistemaJson {
    id: string;
    nombre: string;
    tipo: TipoPlaneta;
    descripcion?: string;
}

export interface DatosGalaxiaJson {
    id?: string;
    nombre: string;
    modoPrueba?: boolean;
    sistemas: DatosSistemaJson[];
    rutas: string[][];
}
