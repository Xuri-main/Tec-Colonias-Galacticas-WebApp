/*
    Archivo: ServicioPartidas.ts
    Descripcion: Administra la creacion, consulta y acciones principales de las partidas.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { configuracionJuego } from '../configuracion/configuracionJuego';
import { Partida } from '../modelos/Partida';
import { NivelRecursosIniciales, TipoConstruccion } from '../tipos/tiposJuego';
import { ServicioGalaxias } from './ServicioGalaxias';
import { ServicioRanking } from './ServicioRanking';

export class ServicioPartidas {
    private partidas: Map<string, Partida>;
    private ciclosRecursos: Map<string, NodeJS.Timeout>;
    private servicioGalaxias: ServicioGalaxias;
    private servicioRanking: ServicioRanking;
    private partidasGuardadasRanking: Set<string>;
    private avisarCambio: ((idPartida: string, estado: object) => void) | null;
    private avisarCambioLista: (() => void) | null;

    /*
         constructor
        Entradas: Servicio de galaxias y servicio de ranking.
        Salidas: Nueva instancia de ServicioPartidas.
        Objetivo: Inicializar la administracion de partidas activas.
    */
    constructor(servicioGalaxias: ServicioGalaxias, servicioRanking: ServicioRanking) {
        this.partidas = new Map<string, Partida>();
        this.ciclosRecursos = new Map<string, NodeJS.Timeout>();
        this.servicioGalaxias = servicioGalaxias;
        this.servicioRanking = servicioRanking;
        this.partidasGuardadasRanking = new Set<string>();
        this.avisarCambio = null;
        this.avisarCambioLista = null;
    }


    /*
         setAvisarCambio
        Entradas: Funcion que recibe id de partida y estado publico.
        Salidas: No retorna valor.
        Objetivo: Registrar una funcion para avisar cambios por WebSocket.
    */
    public setAvisarCambio(avisarCambio: (idPartida: string, estado: object) => void): void {
        this.avisarCambio = avisarCambio;
    }

    /*
         setAvisarCambioLista
        Entradas: Funcion sin parametros.
        Salidas: No retorna valor.
        Objetivo: Registrar una funcion para avisar cambios en la lista de partidas por WebSocket.
    */
    public setAvisarCambioLista(avisarCambioLista: () => void): void {
        this.avisarCambioLista = avisarCambioLista;
    }

    /*
         crearPartida
        Entradas: Nombre, id de galaxia, maximo de jugadores, tiempo maximo y nivel de recursos.
        Salidas: Partida creada.
        Objetivo: Crear una nueva sala de partida usando una galaxia cargada desde JSON.
    */
    public crearPartida(nombre: string, idGalaxia: string, maxJugadores: number, tiempoMaximoMinutos: number, nivelRecursosIniciales: NivelRecursosIniciales): Partida {
        if (!nombre || nombre.trim().length < 3) {
            throw new Error('El nombre de la partida debe tener al menos 3 caracteres.');
        }

        if (this.existePartidaEnEsperaConNombre(nombre)) {
            throw new Error('Ya existe una partida en espera con ese nombre. Use otro nombre para crear una sala nueva.');
        }

        const galaxia = this.servicioGalaxias.obtenerGalaxiaPorId(idGalaxia);
        const idPartida = this.crearIdPartida();
        const partida = new Partida(idPartida, nombre, galaxia, maxJugadores, tiempoMaximoMinutos, nivelRecursosIniciales);
        this.partidas.set(idPartida, partida);
        this.programarCierrePorEspera(partida);
        this.notificarCambioLista();
        return partida;
    }

    /*
         listarPartidas
        Entradas: No recibe entradas.
        Salidas: Lista resumida de partidas.
        Objetivo: Mostrar las partidas disponibles para los jugadores.
    */
    public listarPartidas(): object[] {
        return Array.from(this.partidas.values()).map((partida) => partida.obtenerResumen());
    }

    /*
         obtenerPartida
        Entradas: Id de la partida.
        Salidas: Partida encontrada.
        Objetivo: Buscar una partida y validar que exista.
    */
    public obtenerPartida(idPartida: string): Partida {
        const partida = this.partidas.get(idPartida);

        if (!partida) {
            throw new Error('Partida no encontrada.');
        }

        return partida;
    }

    /*
         unirJugador
        Entradas: Id de partida, idSocket y nickname.
        Salidas: Estado publico actualizado de la partida.
        Objetivo: Agregar un jugador a una sala de espera.
    */
    public unirJugador(idPartida: string, idSocket: string, nickname: string): object {
        const partida = this.obtenerPartida(idPartida);
        partida.agregarJugador(idSocket, nickname);
        this.notificarCambioLista();
        this.notificarCambioPartida(partida);
        return partida.obtenerEstadoPublico();
    }

    /*
         iniciarPartida
        Entradas: Id de la partida.
        Salidas: Estado publico actualizado de la partida.
        Objetivo: Iniciar una partida y activar su ciclo de recursos.
    */
    public iniciarPartida(idPartida: string): object {
        const partida = this.obtenerPartida(idPartida);
        partida.iniciar();
        this.iniciarCicloRecursos(partida);
        this.notificarCambioLista();
        this.notificarCambioPartida(partida);
        return partida.obtenerEstadoPublico();
    }

    /*
         construir
        Entradas: Id de partida, jugador, sistema y tipo de construccion.
        Salidas: Estado publico actualizado de la partida.
        Objetivo: Ejecutar una construccion dentro de una partida.
    */
    public construir(idPartida: string, jugadorId: string, sistemaId: string, tipoConstruccion: TipoConstruccion): object {
        const partida = this.obtenerPartida(idPartida);
        partida.construir(jugadorId, sistemaId, tipoConstruccion);
        this.guardarRankingSiFinalizo(partida);
        this.notificarCambioPartida(partida);
        this.notificarCambioLista();
        return partida.obtenerEstadoPublico();
    }

    /*
         moverFlotas
        Entradas: Id de partida, jugador, origen, destino y cantidad.
        Salidas: Estado publico actualizado de la partida.
        Objetivo: Ejecutar movimiento de flotas y posibles conquistas.
    */
    public moverFlotas(idPartida: string, jugadorId: string, origenId: string, destinoId: string, cantidad: number): object {
        const partida = this.obtenerPartida(idPartida);
        partida.moverFlotas(jugadorId, origenId, destinoId, cantidad);
        this.guardarRankingSiFinalizo(partida);
        this.notificarCambioPartida(partida);
        this.notificarCambioLista();
        return partida.obtenerEstadoPublico();
    }

    /*
         notificarCambioPartida
        Entradas: Partida actualizada.
        Salidas: No retorna valor.
        Objetivo: Avisar a los clientes conectados que una partida cambio de estado.
    */
    private notificarCambioPartida(partida: Partida): void {
        if (this.avisarCambio) {
            this.avisarCambio(partida.getId(), partida.obtenerEstadoPublico());
        }
    }

    /*
         notificarCambioLista
        Entradas: No recibe entradas.
        Salidas: No retorna valor.
        Objetivo: Avisar a los clientes conectados que la lista de partidas cambio.
    */
    private notificarCambioLista(): void {
        if (this.avisarCambioLista) {
            this.avisarCambioLista();
        }
    }

    /*
         existePartidaEnEsperaConNombre
        Entradas: Nombre de partida.
        Salidas: Verdadero si ya existe una partida en espera con ese nombre.
        Objetivo: Evitar salas duplicadas creadas por error con el mismo nombre.
    */
    private existePartidaEnEsperaConNombre(nombre: string): boolean {
        const nombreNormalizado = nombre.trim().toLowerCase();

        for (const partida of this.partidas.values()) {
            const resumen = partida.obtenerResumen() as { nombre: string; estado: string };

            if (resumen.estado === 'esperando' && resumen.nombre.trim().toLowerCase() === nombreNormalizado) {
                return true;
            }
        }

        return false;
    }

    /*
         crearIdPartida
        Entradas: No recibe entradas.
        Salidas: Id simple de partida.
        Objetivo: Crear un identificador unico para cada partida.
    */
    private crearIdPartida(): string {
        return `P${Date.now()}`;
    }

    /*
         programarCierrePorEspera
        Entradas: Partida creada.
        Salidas: No retorna valor.
        Objetivo: Cerrar salas que no inician dentro del tiempo configurado.
    */
    private programarCierrePorEspera(partida: Partida): void {
        const milisegundos = configuracionJuego.minutosEsperaPartida * 60 * 1000;

        setTimeout(() => {
            partida.cerrarPorEspera();
            this.notificarCambioPartida(partida);
            this.notificarCambioLista();
        }, milisegundos);
    }

    /*
         iniciarCicloRecursos
        Entradas: Partida iniciada.
        Salidas: No retorna valor.
        Objetivo: Crear el ciclo automatico de produccion de recursos.
    */
    private iniciarCicloRecursos(partida: Partida): void {
        if (this.ciclosRecursos.has(partida.getId())) {
            return;
        }

        const ciclo = setInterval(() => {
            partida.producirRecursos();

            this.notificarCambioPartida(partida);

            if (partida.getEstado() === 'finalizada') {
                clearInterval(ciclo);
                this.ciclosRecursos.delete(partida.getId());
                this.guardarRankingSiFinalizo(partida);
            }
        }, configuracionJuego.segundosCicloRecursos * 1000);

        this.ciclosRecursos.set(partida.getId(), ciclo);
    }

    /*
         guardarRankingSiFinalizo
        Entradas: Partida a revisar.
        Salidas: No retorna valor.
        Objetivo: Guardar el resultado cuando una partida finaliza.
    */
    private guardarRankingSiFinalizo(partida: Partida): void {
        if (partida.getEstado() === 'finalizada' && !this.partidasGuardadasRanking.has(partida.getId())) {
            this.servicioRanking.guardarResultadoPartida(partida);
            this.partidasGuardadasRanking.add(partida.getId());
        }
    }
}
