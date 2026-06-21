import { Recursos } from './Recursos';
import { JugadorDTO } from '../types/gameTypes';

/**
 * Representa a un jugador autenticado por nickname.
 * No maneja contraseña ni usuarios persistentes porque el enunciado solo solicita nickname.
 */
export class Jugador {
  private readonly id: string;
  private socketId: string | null;
  private readonly nickname: string;
  private readonly recursos: Recursos;
  private planetaBaseId: string | null;
  private eliminado: boolean;

  /**
   * Crea un jugador.
   * @param id Identificador interno único del jugador dentro del servidor.
   * @param nickname Nombre visible del jugador. No puede estar vacío.
   * @param recursosIniciales Recursos iniciales según nivel bajo, normal o alto.
   * @param socketId Identificador del socket conectado, si existe.
   */
  constructor(
    id: string,
    nickname: string,
    recursosIniciales: Recursos,
    socketId: string | null = null,
  ) {
    const nicknameLimpio = nickname.trim();

    if (!id.trim()) {
      throw new Error('El id del jugador es obligatorio.');
    }

    if (!nicknameLimpio) {
      throw new Error('El nickname del jugador es obligatorio.');
    }

    this.id = id;
    this.nickname = nicknameLimpio;
    this.recursos = recursosIniciales.clonar();
    this.socketId = socketId;
    this.planetaBaseId = null;
    this.eliminado = false;
  }

  /**
   * Actualiza el socket activo del jugador.
   * @param socketId Nuevo socket o null si se desconectó.
   */
  public actualizarSocketId(socketId: string | null): void {
    this.socketId = socketId;
  }

  /**
   * Asigna el planeta base inicial del jugador.
   * @param sistemaId Id del sistema planetario base.
   */
  public asignarPlanetaBase(sistemaId: string): void {
    if (!sistemaId.trim()) {
      throw new Error('El id del planeta base es obligatorio.');
    }

    this.planetaBaseId = sistemaId;
  }

  /**
   * Agrega recursos al jugador.
   * @param recursos Recursos generados o recolectados.
   */
  public agregarRecursos(recursos: Recursos): void {
    this.recursos.sumar(recursos);
  }

  /**
   * Descuenta recursos para una acción del juego.
   * @param costo Costo de construcción u operación.
   * @throws Error si el jugador no tiene recursos suficientes.
   */
  public gastarRecursos(costo: Recursos): void {
    this.recursos.restar(costo);
  }

  /**
   * Marca al jugador como eliminado.
   */
  public marcarEliminado(): void {
    this.eliminado = true;
  }

  /**
   * Convierte el jugador a objeto plano para enviar por HTTP o WebSocket.
   * @returns DTO serializable del jugador.
   */
  public toDTO(): JugadorDTO {
    return {
      id: this.id,
      socketId: this.socketId,
      nickname: this.nickname,
      recursos: this.recursos.toDTO(),
      planetaBaseId: this.planetaBaseId,
      eliminado: this.eliminado,
    };
  }

  public getId(): string {
    return this.id;
  }

  public getSocketId(): string | null {
    return this.socketId;
  }

  public getNickname(): string {
    return this.nickname;
  }

  public getRecursos(): Recursos {
    return this.recursos;
  }

  public getPlanetaBaseId(): string | null {
    return this.planetaBaseId;
  }

  public estaEliminado(): boolean {
    return this.eliminado;
  }
}
