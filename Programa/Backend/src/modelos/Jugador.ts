/*
    Archivo: Jugador.ts
    Descripcion: Representa a un jugador conectado a una partida.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { Recursos } from './Recursos';

export class Jugador {
    private id: string;
    private idSocket: string;
    private nickname: string;
    private recursos: Recursos;
    private planetaBaseId: string | null;
    private eliminado: boolean;

    /*
         constructor
        Entradas: id, idSocket, nickname y recursos iniciales.
        Salidas: Nueva instancia de Jugador.
        Objetivo: Inicializar los datos principales del jugador.
    */
    constructor(id: string, idSocket: string, nickname: string, recursosIniciales: Recursos) {
        this.id = id;
        this.idSocket = idSocket;
        this.nickname = nickname.trim();
        this.recursos = recursosIniciales.clonar();
        this.planetaBaseId = null;
        this.eliminado = false;
    }

    /*
         getId
        Entradas: No recibe entradas.
        Salidas: Identificador del jugador.
        Objetivo: Obtener el id interno del jugador.
    */
    public getId(): string {
        return this.id;
    }

    /*
         getIdSocket
        Entradas: No recibe entradas.
        Salidas: Identificador del socket.
        Objetivo: Obtener el id de conexion del jugador.
    */
    public getIdSocket(): string {
        return this.idSocket;
    }

    /*
         setIdSocket
        Entradas: Nuevo id de socket.
        Salidas: No retorna valor.
        Objetivo: Actualizar el socket cuando el jugador se reconecta.
    */
    public setIdSocket(idSocket: string): void {
        this.idSocket = idSocket;
    }

    /*
         getNickname
        Entradas: No recibe entradas.
        Salidas: Nickname del jugador.
        Objetivo: Obtener el nombre visible del jugador.
    */
    public getNickname(): string {
        return this.nickname;
    }

    /*
         getRecursos
        Entradas: No recibe entradas.
        Salidas: Recursos actuales del jugador.
        Objetivo: Obtener los recursos disponibles del jugador.
    */
    public getRecursos(): Recursos {
        return this.recursos;
    }

    /*
         getPlanetaBaseId
        Entradas: No recibe entradas.
        Salidas: Id del planeta base o null.
        Objetivo: Obtener el planeta base asignado al jugador.
    */
    public getPlanetaBaseId(): string | null {
        return this.planetaBaseId;
    }

    /*
         setPlanetaBaseId
        Entradas: Id del sistema base.
        Salidas: No retorna valor.
        Objetivo: Asignar el planeta base inicial al jugador.
    */
    public setPlanetaBaseId(planetaBaseId: string): void {
        this.planetaBaseId = planetaBaseId;
    }

    /*
         estaEliminado
        Entradas: No recibe entradas.
        Salidas: Verdadero si el jugador fue eliminado.
        Objetivo: Consultar si el jugador sigue activo en la partida.
    */
    public estaEliminado(): boolean {
        return this.eliminado;
    }

    /*
         eliminar
        Entradas: No recibe entradas.
        Salidas: No retorna valor.
        Objetivo: Marcar al jugador como eliminado.
    */
    public eliminar(): void {
        this.eliminado = true;
    }

    /*
         agregarRecursos
        Entradas: Recursos que se agregaran al jugador.
        Salidas: No retorna valor.
        Objetivo: Sumar produccion o recompensas al jugador.
    */
    public agregarRecursos(recursos: Recursos): void {
        this.recursos.sumar(recursos);
    }

    /*
         gastarRecursos
        Entradas: Recursos que se desean gastar.
        Salidas: Verdadero si el gasto fue realizado.
        Objetivo: Descontar recursos para construcciones o acciones.
    */
    public gastarRecursos(costo: Recursos): boolean {
        return this.recursos.restar(costo);
    }

    /*
         toJSON
        Entradas: No recibe entradas.
        Salidas: Objeto simple con los datos del jugador.
        Objetivo: Preparar los datos del jugador para respuestas del servidor.
    */
    public toJSON(): object {
        return {
            id: this.id,
            idSocket: this.idSocket,
            nickname: this.nickname,
            recursos: this.recursos.toJSON(),
            planetaBaseId: this.planetaBaseId,
            eliminado: this.eliminado
        };
    }
}
