import { randomUUID } from 'crypto';
import { gameConfig } from '../config/gameConfig';
import { Galaxia } from './Galaxia';
import { Jugador } from './Jugador';
import { Recursos } from './Recursos';
import {
  EstadoPartida,
  NivelRecursosIniciales,
  PartidaDTO,
  TipoInstalacion,
} from '../types/gameTypes';

/**
 * Agregado principal de la lógica de una partida.
 * Centraliza jugadores, estado, galaxia mutable, producción, construcción,
 * movilización de flotas y condiciones básicas de finalización.
 */
export class Partida {
  private readonly id: string;
  private readonly nombre: string;
  private readonly galaxia: Galaxia;
  private readonly jugadores: Map<string, Jugador>;
  private readonly maxJugadores: number;
  private readonly nivelRecursosIniciales: NivelRecursosIniciales;
  private readonly tiempoMaximoMinutos: number;
  private estado: EstadoPartida;
  private readonly creadaEn: Date;
  private iniciadaEn: Date | null;
  private finalizadaEn: Date | null;

  /**
   * Crea una partida nueva.
   * @param nombre Nombre visible de la partida.
   * @param galaxia Galaxia base; se clona para aislar el estado de esta partida.
   * @param maxJugadores Cantidad máxima de jugadores.
   * @param tiempoMaximoMinutos Duración máxima de la partida.
   * @param nivelRecursosIniciales Nivel bajo, normal o alto.
   */
  constructor(
    nombre: string,
    galaxia: Galaxia,
    maxJugadores: number,
    tiempoMaximoMinutos: number,
    nivelRecursosIniciales: NivelRecursosIniciales,
  ) {
    if (!nombre.trim()) {
      throw new Error('El nombre de la partida es obligatorio.');
    }

    if (!Number.isInteger(maxJugadores) || maxJugadores < 2) {
      throw new Error('La partida requiere al menos 2 jugadores.');
    }

    if (!Number.isInteger(tiempoMaximoMinutos) || tiempoMaximoMinutos <= 0) {
      throw new Error('El tiempo máximo de partida debe ser mayor a cero.');
    }

    this.id = randomUUID();
    this.nombre = nombre.trim();
    this.galaxia = galaxia.clonarParaPartida();
    this.jugadores = new Map<string, Jugador>();
    this.maxJugadores = maxJugadores;
    this.tiempoMaximoMinutos = tiempoMaximoMinutos;
    this.nivelRecursosIniciales = nivelRecursosIniciales;
    this.estado = 'esperando';
    this.creadaEn = new Date();
    this.iniciadaEn = null;
    this.finalizadaEn = null;
  }

  /**
   * Indica si un jugador puede incorporarse a la partida.
   * @returns true si la partida está esperando y aún hay cupo.
   */
  public puedeUnirse(): boolean {
    return this.estado === 'esperando' && this.jugadores.size < this.maxJugadores;
  }

  /**
   * Agrega un jugador a la sala de espera.
   * @param nickname Nickname del jugador.
   * @param socketId Socket actual del jugador.
   * @returns Jugador creado.
   */
  public unirJugador(nickname: string, socketId: string | null = null): Jugador {
    if (!this.puedeUnirse()) {
      throw new Error('No es posible unirse a esta partida.');
    }

    const nicknameLimpio = nickname.trim().toLowerCase();
    const nicknameDuplicado = Array.from(this.jugadores.values()).some(
      (jugador) => jugador.getNickname().toLowerCase() === nicknameLimpio,
    );

    if (nicknameDuplicado) {
      throw new Error('Ya existe un jugador con ese nickname en la partida.');
    }

    const jugador = new Jugador(
      randomUUID(),
      nickname,
      gameConfig.recursosIniciales[this.nivelRecursosIniciales],
      socketId,
    );

    this.jugadores.set(jugador.getId(), jugador);

    if (this.jugadores.size === this.maxJugadores) {
      this.estado = 'lista';
    }

    return jugador;
  }

  /**
   * Inicia la partida después de la cuenta regresiva.
   * Antes de este método no deben ejecutarse cambios ni producción.
   */
  public iniciar(): void {
    if (this.estado !== 'lista' && this.estado !== 'enCuentaRegresiva') {
      throw new Error('La partida no está lista para iniciar.');
    }

    this.asignarPlanetasBase();
    this.estado = 'iniciada';
    this.iniciadaEn = new Date();
  }

  /**
   * Cambia el estado a cuenta regresiva antes del arranque real.
   */
  public marcarEnCuentaRegresiva(): void {
    if (this.estado !== 'lista') {
      throw new Error('La cuenta regresiva solo puede iniciar cuando la partida está lista.');
    }

    this.estado = 'enCuentaRegresiva';
  }

  /**
   * Cierra una partida que no logró iniciar.
   */
  public cerrarPorExpiracion(): void {
    if (this.estado !== 'esperando') {
      throw new Error('Solo se pueden cerrar por expiración las partidas en espera.');
    }

    this.estado = 'cerrada';
    this.finalizadaEn = new Date();
  }

  /**
   * Ejecuta un ciclo de producción automática.
   * @returns Recursos generados por jugador.
   */
  public ejecutarCicloProduccion(): Map<string, Recursos> {
    this.validarPartidaIniciada();

    const produccionPorJugador = new Map<string, Recursos>();

    this.galaxia.obtenerTodosLosSistemas().forEach((sistema) => {
      const propietarioId = sistema.getPropietarioId();

      if (!propietarioId) {
        return;
      }

      const jugador = this.obtenerJugador(propietarioId);
      const produccion = sistema.calcularProduccion();

      jugador.agregarRecursos(produccion);

      if (!produccionPorJugador.has(propietarioId)) {
        produccionPorJugador.set(propietarioId, new Recursos());
      }

      produccionPorJugador.get(propietarioId)?.sumar(produccion);
    });

    return produccionPorJugador;
  }

  /**
   * Construye una instalación en un sistema controlado por el jugador.
   * @param jugadorId Id del jugador.
   * @param sistemaId Id del sistema.
   * @param tipo Tipo de instalación.
   */
  public construir(jugadorId: string, sistemaId: string, tipo: TipoInstalacion): void {
    this.validarPartidaIniciada();

    const jugador = this.obtenerJugador(jugadorId);
    const sistema = this.obtenerSistema(sistemaId);

    if (!sistema.esControladoPor(jugadorId)) {
      throw new Error('Solo se puede construir en sistemas controlados por el jugador.');
    }

    jugador.gastarRecursos(gameConfig.costosConstruccion[tipo]);
    sistema.construirInstalacion(tipo);
  }

  /**
   * Mueve flotas entre sistemas conectados directamente.
   * Si el destino es enemigo, resuelve conquista automática.
   * @param jugadorId Id del jugador.
   * @param origenId Sistema origen.
   * @param destinoId Sistema destino.
   * @param cantidad Cantidad de flotas a movilizar.
   */
  public movilizarFlotas(
    jugadorId: string,
    origenId: string,
    destinoId: string,
    cantidad: number,
  ): void {
    this.validarPartidaIniciada();

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new Error('La cantidad de flotas a movilizar debe ser mayor a cero.');
    }

    if (!this.galaxia.existeRutaDirecta(origenId, destinoId)) {
      throw new Error('Solo se permite mover flotas entre sistemas conectados directamente.');
    }

    const origen = this.obtenerSistema(origenId);
    const destino = this.obtenerSistema(destinoId);

    if (!origen.esControladoPor(jugadorId)) {
      throw new Error('El jugador solo puede movilizar flotas desde sistemas propios.');
    }

    origen.removerFlotas(cantidad);

    const propietarioDestino = destino.getPropietarioId();

    if (propietarioDestino === null || propietarioDestino === jugadorId) {
      destino.controlar(jugadorId, destino.getFlotasEstacionadas() + cantidad);
      return;
    }

    this.resolverCombate(jugadorId, destinoId, cantidad);
    this.verificarFinalizacionPorDominio();
  }

  /**
   * Finaliza la partida.
   */
  public finalizar(): void {
    if (this.estado === 'finalizada') {
      return;
    }

    this.estado = 'finalizada';
    this.finalizadaEn = new Date();
  }

  /**
   * Calcula estadísticas ordenadas por puntaje descendente.
   * @returns Lista de estadísticas por jugador.
   */
  public calcularEstadisticas(): Array<{
    posicion: number;
    puntaje: number;
    jugadorId: string;
    nombre: string;
    sistemasConquistados: number;
    recursosAcumulados: ReturnType<Recursos['toDTO']>;
    flotasEnPie: number;
    minasEnPie: number;
    centrosEnPie: number;
    fortalezasEnPie: number;
  }> {
    const estadisticas = Array.from(this.jugadores.values()).map((jugador) => {
      const sistemas = this.galaxia
        .obtenerTodosLosSistemas()
        .filter((sistema) => sistema.esControladoPor(jugador.getId()));

      const flotasEnPie = sistemas.reduce(
        (total, sistema) => total + sistema.getFlotasEstacionadas(),
        0,
      );

      const minasEnPie = sistemas.reduce(
        (total, sistema) => total + sistema.getInstalaciones().mina,
        0,
      );

      const centrosEnPie = sistemas.reduce(
        (total, sistema) => total + sistema.getInstalaciones().centralInvestigacion,
        0,
      );

      const fortalezasEnPie = sistemas.reduce(
        (total, sistema) => total + sistema.getInstalaciones().fortaleza,
        0,
      );

      const puntaje =
        sistemas.length * 5000 +
        jugador.getRecursos().calcularPuntaje() +
        fortalezasEnPie * 100 +
        centrosEnPie * 150;

      return {
        posicion: 0,
        puntaje,
        jugadorId: jugador.getId(),
        nombre: jugador.getNickname(),
        sistemasConquistados: sistemas.length,
        recursosAcumulados: jugador.getRecursos().toDTO(),
        flotasEnPie,
        minasEnPie,
        centrosEnPie,
        fortalezasEnPie,
      };
    });

    return estadisticas
      .sort((a, b) => b.puntaje - a.puntaje)
      .map((estadistica, index) => ({ ...estadistica, posicion: index + 1 }));
  }

  /**
   * Convierte la partida a objeto plano para API/WebSocket.
   * @returns DTO serializable.
   */
  public toDTO(): PartidaDTO {
    return {
      id: this.id,
      nombre: this.nombre,
      galaxia: this.galaxia.toDTO(),
      jugadores: Array.from(this.jugadores.values()).map((jugador) => jugador.toDTO()),
      maxJugadores: this.maxJugadores,
      estado: this.estado,
      nivelRecursosIniciales: this.nivelRecursosIniciales,
      tiempoMaximoMinutos: this.tiempoMaximoMinutos,
      creadaEn: this.creadaEn.toISOString(),
      iniciadaEn: this.iniciadaEn?.toISOString() ?? null,
      finalizadaEn: this.finalizadaEn?.toISOString() ?? null,
    };
  }

  public getId(): string {
    return this.id;
  }

  public getEstado(): EstadoPartida {
    return this.estado;
  }

  public getGalaxia(): Galaxia {
    return this.galaxia;
  }

  public getJugadores(): Jugador[] {
    return Array.from(this.jugadores.values());
  }

  /**
   * Asigna planetas base iniciales a todos los jugadores.
   * Usa sistemas espaciados para reducir ventaja inicial por cercanía.
   */
  private asignarPlanetasBase(): void {
    const sistemas = this.galaxia.obtenerTodosLosSistemas();

    if (sistemas.length < this.jugadores.size) {
      throw new Error('No hay suficientes sistemas para asignar planetas base.');
    }

    const jugadores = Array.from(this.jugadores.values());
    const salto = Math.max(1, Math.floor(sistemas.length / jugadores.length));

    jugadores.forEach((jugador, index) => {
      const sistema = sistemas[index * salto];
      sistema.controlar(jugador.getId(), 1);
      sistema.construirInstalacion('mina');
      jugador.asignarPlanetaBase(sistema.getId());
    });
  }

  /**
   * Resuelve combate según reglas base del enunciado.
   * Las flotas se neutralizan 1 a 1; luego las restantes destruyen minas y fortalezas.
   * @param atacanteId Id del atacante.
   * @param destinoId Sistema atacado.
   * @param flotasAtacantes Cantidad de flotas enviadas.
   */
  private resolverCombate(atacanteId: string, destinoId: string, flotasAtacantes: number): void {
    const destino = this.obtenerSistema(destinoId);
    const instalaciones = destino.getInstalaciones();

    let flotasRestantesAtacante = flotasAtacantes;
    let flotasDefensor = destino.getFlotasEstacionadas();
    let minasDefensor = instalaciones.mina;
    let fortalezasDefensor = instalaciones.fortaleza;

    const flotasNeutralizadas = Math.min(flotasRestantesAtacante, flotasDefensor);
    flotasRestantesAtacante -= flotasNeutralizadas;
    flotasDefensor -= flotasNeutralizadas;

    const fortalezasDerribadas = Math.min(
      fortalezasDefensor,
      Math.floor(flotasRestantesAtacante / 2),
    );
    fortalezasDefensor -= fortalezasDerribadas;
    flotasRestantesAtacante -= fortalezasDerribadas * 2;

    const minasDerribadas = Math.min(minasDefensor, flotasRestantesAtacante * 3);
    minasDefensor -= minasDerribadas;
    flotasRestantesAtacante -= Math.ceil(minasDerribadas / 3);

    destino.aplicarPerdidas({
      flotas: destino.getFlotasEstacionadas() - flotasDefensor,
      mina: instalaciones.mina - minasDefensor,
      fortaleza: instalaciones.fortaleza - fortalezasDefensor,
    });

    const defensaEliminada = flotasDefensor === 0 && minasDefensor === 0 && fortalezasDefensor === 0;

    if (defensaEliminada && flotasRestantesAtacante > 0) {
      destino.controlar(atacanteId, flotasRestantesAtacante);
    }
  }

  /**
   * Verifica finalización por porcentaje configurable de control.
   */
  private verificarFinalizacionPorDominio(): void {
    const ganador = Array.from(this.jugadores.values()).find(
      (jugador) =>
        this.galaxia.calcularPorcentajeControl(jugador.getId()) >=
        gameConfig.porcentajeControlVictoria,
    );

    if (ganador) {
      this.finalizar();
    }
  }

  /**
   * Obtiene un jugador existente.
   * @param jugadorId Id del jugador.
   * @returns Jugador encontrado.
   */
  private obtenerJugador(jugadorId: string): Jugador {
    const jugador = this.jugadores.get(jugadorId);

    if (!jugador) {
      throw new Error(`No existe el jugador ${jugadorId} en la partida.`);
    }

    return jugador;
  }

  /**
   * Obtiene un sistema existente.
   * @param sistemaId Id del sistema.
   * @returns Sistema encontrado.
   */
  private obtenerSistema(sistemaId: string) {
    const sistema = this.galaxia.obtenerSistema(sistemaId);

    if (!sistema) {
      throw new Error(`No existe el sistema ${sistemaId} en la partida.`);
    }

    return sistema;
  }

  /**
   * Garantiza que la partida esté iniciada antes de modificar estado jugable.
   */
  private validarPartidaIniciada(): void {
    if (this.estado !== 'iniciada') {
      throw new Error('La partida todavía no ha iniciado.');
    }
  }
}
