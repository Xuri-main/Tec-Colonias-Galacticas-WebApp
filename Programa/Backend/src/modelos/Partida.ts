/*
    Archivo: Partida.ts
    Descripcion: Representa una partida activa con sus jugadores, galaxia y reglas principales.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { configuracionJuego } from '../configuracion/configuracionJuego';
import { EstadoPartida, NivelRecursosIniciales, TipoConstruccion } from '../tipos/tiposJuego';
import { Galaxia } from './Galaxia';
import { Jugador } from './Jugador';
import { Recursos } from './Recursos';
import { SistemaPlanetario } from './SistemaPlanetario';

export class Partida {
    private id: string;
    private nombre: string;
    private galaxia: Galaxia;
    private jugadores: Jugador[];
    private maxJugadores: number;
    private tiempoMaximoMinutos: number;
    private nivelRecursosIniciales: NivelRecursosIniciales;
    private estado: EstadoPartida;
    private fechaCreacion: Date;
    private fechaInicio: Date | null;
    private fechaFinalizacion: Date | null;
    private razonFinalizacion: string;
    private eventos: string[];

    /*
         constructor
        Entradas: Id, nombre, galaxia, maximo de jugadores, tiempo maximo y nivel de recursos.
        Salidas: Nueva instancia de Partida.
        Objetivo: Crear una partida en estado de espera.
    */
    constructor(id: string, nombre: string, galaxia: Galaxia, maxJugadores: number, tiempoMaximoMinutos: number, nivelRecursosIniciales: NivelRecursosIniciales) {
        this.id = id;
        this.nombre = nombre.trim();
        this.galaxia = galaxia.clonar();
        this.jugadores = [];
        this.maxJugadores = Math.max(2, maxJugadores);
        this.tiempoMaximoMinutos = Math.max(1, tiempoMaximoMinutos);
        this.nivelRecursosIniciales = nivelRecursosIniciales;
        this.estado = 'esperando';
        this.fechaCreacion = new Date();
        this.fechaInicio = null;
        this.fechaFinalizacion = null;
        this.razonFinalizacion = '';
        this.eventos = [];
    }

    /*
         getId
        Entradas: No recibe entradas.
        Salidas: Id de la partida.
        Objetivo: Obtener el identificador unico de la partida.
    */
    public getId(): string {
        return this.id;
    }

    /*
         getEstado
        Entradas: No recibe entradas.
        Salidas: Estado actual de la partida.
        Objetivo: Consultar si la partida esta esperando, iniciada o finalizada.
    */
    public getEstado(): EstadoPartida {
        return this.estado;
    }

    /*
         getJugadores
        Entradas: No recibe entradas.
        Salidas: Lista de jugadores.
        Objetivo: Obtener los jugadores de la partida.
    */
    public getJugadores(): Jugador[] {
        return this.jugadores;
    }

    /*
         getGalaxia
        Entradas: No recibe entradas.
        Salidas: Galaxia de la partida.
        Objetivo: Obtener el mapa galactico de la partida.
    */
    public getGalaxia(): Galaxia {
        return this.galaxia;
    }

    /*
         getTiempoMaximoMinutos
        Entradas: No recibe entradas.
        Salidas: Tiempo maximo configurado.
        Objetivo: Consultar la duracion maxima de la partida.
    */
    public getTiempoMaximoMinutos(): number {
        return this.tiempoMaximoMinutos;
    }

    /*
         puedeUnirse
        Entradas: No recibe entradas.
        Salidas: Verdadero si se permite unir otro jugador.
        Objetivo: Validar disponibilidad de la sala de espera.
    */
    public puedeUnirse(): boolean {
        return this.estado === 'esperando' && this.jugadores.length < this.maxJugadores;
    }

    /*
         estaLlena
        Entradas: No recibe entradas.
        Salidas: Verdadero si ya se alcanzo el maximo de jugadores.
        Objetivo: Saber cuando una partida esta lista para iniciar.
    */
    public estaLlena(): boolean {
        return this.jugadores.length >= this.maxJugadores;
    }

    /*
         agregarJugador
        Entradas: Id de socket y nickname.
        Salidas: Jugador creado.
        Objetivo: Agregar un jugador a la partida validando nickname y cupo.
    */
    public agregarJugador(idSocket: string, nickname: string): Jugador {
        if (!this.puedeUnirse()) {
            throw new Error('La partida no acepta mas jugadores.');
        }

        if (!nickname || nickname.trim().length < 3) {
            throw new Error('El nickname debe tener al menos 3 caracteres.');
        }

        const nicknameExiste = this.jugadores.some((jugador) => jugador.getNickname().toLowerCase() === nickname.trim().toLowerCase());

        if (nicknameExiste) {
            throw new Error('Ya existe un jugador con ese nickname en la partida.');
        }

        const recursos = this.obtenerRecursosIniciales();
        const jugador = new Jugador(this.crearIdJugador(), idSocket, nickname, recursos);
        this.jugadores.push(jugador);
        this.registrarEvento(`${jugador.getNickname()} se unio a la partida.`);
        return jugador;
    }

    /*
         iniciar
        Entradas: No recibe entradas.
        Salidas: No retorna valor.
        Objetivo: Iniciar la partida y asignar planetas base a los jugadores.
    */
    public iniciar(): void {
        if (this.estado !== 'esperando') {
            throw new Error('La partida no esta en sala de espera.');
        }

        if (this.jugadores.length < 2) {
            throw new Error('Se necesitan al menos 2 jugadores para iniciar.');
        }

        this.estado = 'iniciada';
        this.fechaInicio = new Date();
        this.asignarPlanetasBase();
        this.registrarEvento('La partida ha iniciado.');
    }

    /*
         cerrarPorEspera
        Entradas: No recibe entradas.
        Salidas: No retorna valor.
        Objetivo: Cerrar una partida que no inicio a tiempo.
    */
    public cerrarPorEspera(): void {
        if (this.estado === 'esperando') {
            this.estado = 'cerrada';
            this.fechaFinalizacion = new Date();
            this.razonFinalizacion = 'La sala expiro antes de iniciar.';
            this.registrarEvento('La partida fue cerrada por tiempo de espera.');
        }
    }

    /*
         producirRecursos
        Entradas: No recibe entradas.
        Salidas: No retorna valor.
        Objetivo: Generar recursos para cada jugador segun los sistemas que controla.
    */
    public producirRecursos(): void {
        if (this.estado !== 'iniciada') {
            return;
        }

        for (const sistema of this.galaxia.obtenerSistemas()) {
            const propietarioId = sistema.getPropietarioId();

            if (!propietarioId) {
                continue;
            }

            const jugador = this.buscarJugador(propietarioId);

            if (!jugador || jugador.estaEliminado()) {
                continue;
            }

            const produccionBase = configuracionJuego.produccionPorTipoPlaneta[sistema.getTipo()];
            const produccionSistema = new Recursos(produccionBase.minerales, produccionBase.energia, produccionBase.cristales);

            for (let i = 0; i < sistema.getCentrosInvestigacion(); i++) {
                produccionSistema.sumar(new Recursos(
                    configuracionJuego.produccionPorCentral.minerales,
                    configuracionJuego.produccionPorCentral.energia,
                    configuracionJuego.produccionPorCentral.cristales
                ));
            }

            jugador.agregarRecursos(produccionSistema);
        }

        this.registrarEvento('Se produjo un nuevo ciclo de recursos.');
        this.revisarFinalizacion();
    }

    /*
         construir
        Entradas: Id del jugador, id del sistema y tipo de construccion.
        Salidas: No retorna valor.
        Objetivo: Construir instalaciones en un sistema controlado por el jugador.
    */
    public construir(jugadorId: string, sistemaId: string, tipoConstruccion: TipoConstruccion): void {
        this.validarPartidaIniciada();

        const jugador = this.obtenerJugadorObligatorio(jugadorId);
        const sistema = this.obtenerSistemaObligatorio(sistemaId);

        if (!sistema.estaControladoPor(jugadorId)) {
            throw new Error('Solo se puede construir en sistemas controlados por el jugador.');
        }

        const costoConfig = configuracionJuego.costosConstruccion[tipoConstruccion];
        const costo = new Recursos(costoConfig.minerales, costoConfig.energia, costoConfig.cristales);

        if (!jugador.gastarRecursos(costo)) {
            throw new Error('Recursos insuficientes para construir.');
        }

        sistema.construir(tipoConstruccion);
        this.registrarEvento(`${jugador.getNickname()} construyo ${tipoConstruccion} en ${sistema.getNombre()}.`);
        this.revisarFinalizacion();
    }

    /*
         moverFlotas
        Entradas: Id del jugador, origen, destino y cantidad.
        Salidas: Mensaje del resultado.
        Objetivo: Mover flotas entre sistemas conectados y resolver conquista si aplica.
    */
    public moverFlotas(jugadorId: string, origenId: string, destinoId: string, cantidad: number): string {
        this.validarPartidaIniciada();

        const jugador = this.obtenerJugadorObligatorio(jugadorId);
        const origen = this.obtenerSistemaObligatorio(origenId);
        const destino = this.obtenerSistemaObligatorio(destinoId);
        const cantidadEntera = Math.floor(cantidad);

        if (cantidadEntera <= 0) {
            throw new Error('La cantidad de flotas debe ser mayor a cero.');
        }

        if (!origen.estaControladoPor(jugadorId)) {
            throw new Error('El sistema de origen no pertenece al jugador.');
        }

        if (!this.galaxia.existeRutaDirecta(origenId, destinoId)) {
            throw new Error('Los sistemas no estan conectados directamente.');
        }

        if (!origen.quitarFlotas(cantidadEntera)) {
            throw new Error('No hay suficientes flotas en el sistema de origen.');
        }

        const resultado = this.resolverLlegadaFlotas(jugador, destino, cantidadEntera);
        this.registrarEvento(resultado);
        this.revisarEliminados();
        this.revisarFinalizacion();
        return resultado;
    }

    /*
         obtenerEstadoPublico
        Entradas: No recibe entradas.
        Salidas: Objeto con el estado visible de la partida.
        Objetivo: Enviar el estado de la partida al frontend.
    */
    public obtenerEstadoPublico(): object {
        return {
            id: this.id,
            nombre: this.nombre,
            galaxia: this.galaxia.toJSON(),
            jugadores: this.jugadores.map((jugador) => jugador.toJSON()),
            jugadoresActuales: this.jugadores.length,
            maxJugadores: this.maxJugadores,
            estado: this.estado,
            tiempoMaximoMinutos: this.tiempoMaximoMinutos,
            fechaCreacion: this.fechaCreacion,
            fechaInicio: this.fechaInicio,
            fechaFinalizacion: this.fechaFinalizacion,
            razonFinalizacion: this.razonFinalizacion,
            tiempoJugadoSegundos: this.calcularTiempoJugadoSegundos(),
            ganador: this.obtenerGanador(),
            estadisticasFinales: this.estado === 'finalizada' ? this.calcularEstadisticas() : [],
            eventos: this.eventos.slice(-20)
        };
    }

    /*
         obtenerResumen
        Entradas: No recibe entradas.
        Salidas: Objeto resumido de la partida.
        Objetivo: Mostrar partidas disponibles en la sala principal.
    */
    public obtenerResumen(): object {
        return {
            id: this.id,
            nombre: this.nombre,
            galaxia: this.galaxia.getNombre(),
            jugadoresActuales: this.jugadores.length,
            maxJugadores: this.maxJugadores,
            estado: this.estado
        };
    }

    /*
         calcularEstadisticas
        Entradas: No recibe entradas.
        Salidas: Lista de estadisticas de jugadores.
        Objetivo: Calcular puntajes finales de una partida.
    */
    public calcularEstadisticas(): object[] {
        const estadisticas = this.jugadores.map((jugador) => {
            const sistemas = this.galaxia.obtenerSistemas().filter((sistema) => sistema.estaControladoPor(jugador.getId()));
            let flotas = 0;
            let minas = 0;
            let centros = 0;
            let fortalezas = 0;

            for (const sistema of sistemas) {
                flotas += sistema.getFlotas();
                minas += sistema.getMinas();
                centros += sistema.getCentrosInvestigacion();
                fortalezas += sistema.getFortalezas();
            }

            const puntaje = (sistemas.length * 5000)
                + jugador.getRecursos().obtenerPuntaje()
                + (fortalezas * 100)
                + (centros * 150);

            return {
                puntaje,
                nombre: jugador.getNickname(),
                jugadorId: jugador.getId(),
                sistemasConquistados: sistemas.length,
                recursosAcumulados: jugador.getRecursos().toJSON(),
                flotasEnPie: flotas,
                minasEnPie: minas,
                centrosEnPie: centros,
                fortalezasEnPie: fortalezas,
                eliminado: jugador.estaEliminado()
            };
        });

        estadisticas.sort((a: any, b: any) => b.puntaje - a.puntaje);

        return estadisticas.map((dato: any, indice: number) => {
            return {
                posicion: indice + 1,
                ...dato
            };
        });
    }

    /*
         finalizar
        Entradas: Razon de cierre de la partida.
        Salidas: No retorna valor.
        Objetivo: Finalizar la partida manualmente o por una condicion de victoria.
    */
    public finalizar(razon: string = 'Finalizacion manual de la partida.'): void {
        if (this.estado === 'finalizada') {
            return;
        }

        this.estado = 'finalizada';
        this.fechaFinalizacion = new Date();
        this.razonFinalizacion = razon;
        this.registrarEvento(`La partida ha finalizado. Motivo: ${razon}`);
    }

    /*
         obtenerGanador
        Entradas: No recibe entradas.
        Salidas: Estadistica del ganador o null.
        Objetivo: Obtener el primer lugar segun el puntaje calculado.
    */
    public obtenerGanador(): object | null {
        const estadisticas = this.calcularEstadisticas();
        return estadisticas.length > 0 ? estadisticas[0] : null;
    }

    /*
         calcularTiempoJugadoSegundos
        Entradas: No recibe entradas.
        Salidas: Tiempo jugado en segundos.
        Objetivo: Calcular la duracion real de la partida.
    */
    public calcularTiempoJugadoSegundos(): number {
        if (!this.fechaInicio) {
            return 0;
        }

        const fechaFin = this.fechaFinalizacion || new Date();
        return Math.max(0, Math.floor((fechaFin.getTime() - this.fechaInicio.getTime()) / 1000));
    }

    /*
         obtenerTiempoPartidaTexto
        Entradas: No recibe entradas.
        Salidas: Tiempo de partida en formato legible.
        Objetivo: Preparar la duracion para ranking y pantallas finales.
    */
    public obtenerTiempoPartidaTexto(): string {
        const segundosTotales = this.calcularTiempoJugadoSegundos();
        const minutos = Math.floor(segundosTotales / 60);
        const segundos = segundosTotales % 60;
        return `${minutos}m ${segundos}s`;
    }

    /*
         obtenerRecursosIniciales
        Entradas: No recibe entradas.
        Salidas: Recursos iniciales segun el nivel configurado.
        Objetivo: Crear los recursos iniciales para un jugador nuevo.
    */
    private obtenerRecursosIniciales(): Recursos {
        const datos = configuracionJuego.recursosIniciales[this.nivelRecursosIniciales];
        return new Recursos(datos.minerales, datos.energia, datos.cristales);
    }

    /*
         crearIdJugador
        Entradas: No recibe entradas.
        Salidas: Id simple de jugador.
        Objetivo: Crear un identificador unico dentro de la partida.
    */
    private crearIdJugador(): string {
        return `J${this.jugadores.length + 1}_${Date.now()}`;
    }

    /*
         asignarPlanetasBase
        Entradas: No recibe entradas.
        Salidas: No retorna valor.
        Objetivo: Asignar un sistema inicial distinto a cada jugador.
    */
    private asignarPlanetasBase(): void {
        const sistemas = this.galaxia.obtenerSistemas();

        for (let i = 0; i < this.jugadores.length; i++) {
            const jugador = this.jugadores[i];
            const sistema = sistemas[i];

            if (!sistema) {
                throw new Error('No hay suficientes sistemas para asignar bases.');
            }

            sistema.cambiarPropietario(jugador.getId());
            sistema.agregarFlotas(configuracionJuego.flotasInicialesPorJugador);
            jugador.setPlanetaBaseId(sistema.getId());
            this.registrarEvento(`${jugador.getNickname()} recibe como base ${sistema.getNombre()}.`);
        }
    }

    /*
         buscarJugador
        Entradas: Id del jugador.
        Salidas: Jugador encontrado o undefined.
        Objetivo: Buscar un jugador dentro de la partida.
    */
    private buscarJugador(jugadorId: string): Jugador | undefined {
        return this.jugadores.find((jugador) => jugador.getId() === jugadorId);
    }

    /*
         obtenerJugadorObligatorio
        Entradas: Id del jugador.
        Salidas: Jugador encontrado.
        Objetivo: Buscar un jugador y lanzar error si no existe.
    */
    private obtenerJugadorObligatorio(jugadorId: string): Jugador {
        const jugador = this.buscarJugador(jugadorId);

        if (!jugador) {
            throw new Error('Jugador no encontrado.');
        }

        if (jugador.estaEliminado()) {
            throw new Error('El jugador esta eliminado.');
        }

        return jugador;
    }

    /*
         obtenerSistemaObligatorio
        Entradas: Id del sistema.
        Salidas: Sistema encontrado.
        Objetivo: Buscar un sistema y lanzar error si no existe.
    */
    private obtenerSistemaObligatorio(sistemaId: string): SistemaPlanetario {
        const sistema = this.galaxia.obtenerSistema(sistemaId);

        if (!sistema) {
            throw new Error('Sistema planetario no encontrado.');
        }

        return sistema;
    }

    /*
         validarPartidaIniciada
        Entradas: No recibe entradas.
        Salidas: No retorna valor.
        Objetivo: Evitar acciones de juego antes de iniciar la partida.
    */
    private validarPartidaIniciada(): void {
        if (this.estado !== 'iniciada') {
            throw new Error('La partida no esta iniciada.');
        }
    }

    /*
         resolverLlegadaFlotas
        Entradas: Jugador atacante, sistema destino y cantidad de flotas.
        Salidas: Mensaje del resultado.
        Objetivo: Resolver movimiento, refuerzo o conquista del sistema destino.
    */
    private resolverLlegadaFlotas(jugador: Jugador, destino: SistemaPlanetario, cantidad: number): string {
        const propietarioDestino = destino.getPropietarioId();

        if (!propietarioDestino) {
            destino.cambiarPropietario(jugador.getId());
            destino.agregarFlotas(cantidad);
            return `${jugador.getNickname()} conquisto el sistema libre ${destino.getNombre()}.`;
        }

        if (propietarioDestino === jugador.getId()) {
            destino.agregarFlotas(cantidad);
            return `${jugador.getNickname()} movio ${cantidad} flotas a ${destino.getNombre()}.`;
        }

        return this.resolverCombate(jugador, destino, cantidad);
    }

    /*
         resolverCombate
        Entradas: Jugador atacante, sistema defensor y flotas atacantes.
        Salidas: Mensaje del resultado del combate.
        Objetivo: Aplicar reglas basicas de neutralizacion y conquista.
    */
    private resolverCombate(jugador: Jugador, destino: SistemaPlanetario, flotasAtacantes: number): string {
        const flotasDefensoras = destino.getFlotas();
        const minas = destino.getMinas();
        const fortalezas = destino.getFortalezas();
        const fuerzaDefensa = flotasDefensoras + Math.ceil(minas / 3) + (fortalezas * 2);

        if (flotasAtacantes > fuerzaDefensa) {
            const flotasRestantes = flotasAtacantes - fuerzaDefensa;
            destino.descontarDefensas(minas, fortalezas, flotasDefensoras);
            destino.cambiarPropietario(jugador.getId());
            destino.agregarFlotas(flotasRestantes);
            return `${jugador.getNickname()} conquisto ${destino.getNombre()} con ${flotasRestantes} flotas restantes.`;
        }

        const flotasPerdidas = Math.min(flotasDefensoras, flotasAtacantes);
        const ataqueLuegoDeFlotas = Math.max(0, flotasAtacantes - flotasDefensoras);
        const minasPerdidas = Math.min(minas, ataqueLuegoDeFlotas * 3);
        const ataqueLuegoDeMinas = Math.max(0, ataqueLuegoDeFlotas - Math.ceil(minasPerdidas / 3));
        const fortalezasPerdidas = Math.min(fortalezas, Math.floor(ataqueLuegoDeMinas / 2));

        destino.descontarDefensas(minasPerdidas, fortalezasPerdidas, flotasPerdidas);
        return `${jugador.getNickname()} ataco ${destino.getNombre()}, pero no logro conquistarlo.`;
    }

    /*
         revisarEliminados
        Entradas: No recibe entradas.
        Salidas: No retorna valor.
        Objetivo: Marcar jugadores sin sistemas como eliminados.
    */
    private revisarEliminados(): void {
        for (const jugador of this.jugadores) {
            const sistemas = this.galaxia.contarSistemasControladosPor(jugador.getId());

            if (sistemas === 0 && !jugador.estaEliminado() && this.estado === 'iniciada') {
                jugador.eliminar();
                this.registrarEvento(`${jugador.getNickname()} fue eliminado.`);
            }
        }
    }

    /*
         revisarFinalizacion
        Entradas: No recibe entradas.
        Salidas: No retorna valor.
        Objetivo: Revisar condiciones de finalizacion de partida.
    */
    private revisarFinalizacion(): void {
        if (this.estado !== 'iniciada') {
            return;
        }

        const totalSistemas = this.galaxia.obtenerSistemas().length;

        for (const jugador of this.jugadores) {
            const controlados = this.galaxia.contarSistemasControladosPor(jugador.getId());
            const porcentaje = (controlados / totalSistemas) * 100;

            if (porcentaje >= configuracionJuego.porcentajeVictoria) {
                this.finalizar(`${jugador.getNickname()} controlo ${controlados} de ${totalSistemas} sistemas planetarios.`);
                return;
            }
        }

        const jugadoresActivos = this.jugadores.filter((jugador) => !jugador.estaEliminado());

        if (jugadoresActivos.length <= 1) {
            const ganador = jugadoresActivos[0];
            const textoGanador = ganador ? ganador.getNickname() : 'No hay jugadores activos';
            this.finalizar(`Solo queda un jugador activo: ${textoGanador}.`);
            return;
        }

        if (this.fechaInicio) {
            const minutosJugados = this.calcularTiempoJugadoSegundos() / 60;

            if (minutosJugados >= this.tiempoMaximoMinutos) {
                this.finalizar('Se alcanzo el tiempo maximo configurado para la partida.');
            }
        }
    }

    /*
         registrarEvento
        Entradas: Mensaje del evento.
        Salidas: No retorna valor.
        Objetivo: Guardar eventos importantes de la partida.
    */
    private registrarEvento(mensaje: string): void {
        this.eventos.push(`${new Date().toLocaleTimeString()} - ${mensaje}`);

        if (this.eventos.length > 100) {
            this.eventos.shift();
        }
    }
}
