import { RutaEspacialDTO } from '../types/gameTypes';

/**
 * Arista del grafo galáctico.
 * Guarda únicamente ids para evitar referencias circulares al serializar.
 */
export class RutaEspacial {
  private readonly id: string;
  private readonly origenId: string;
  private readonly destinoId: string;
  private readonly distanciaTiempo: number;

  /**
   * Crea una ruta espacial entre dos sistemas.
   * @param origenId Id del sistema origen.
   * @param destinoId Id del sistema destino.
   * @param distanciaTiempo Tiempo o peso de viaje. Debe ser >= 1.
   */
  constructor(origenId: string, destinoId: string, distanciaTiempo = 1) {
    if (!origenId.trim() || !destinoId.trim()) {
      throw new Error('La ruta espacial requiere origen y destino.');
    }

    if (origenId === destinoId) {
      throw new Error('Una ruta espacial no puede conectar un sistema consigo mismo.');
    }

    if (!Number.isFinite(distanciaTiempo) || distanciaTiempo <= 0) {
      throw new Error('La distancia o tiempo de ruta debe ser mayor a cero.');
    }

    this.origenId = origenId;
    this.destinoId = destinoId;
    this.distanciaTiempo = distanciaTiempo;
    this.id = RutaEspacial.crearId(origenId, destinoId);
  }

  /**
   * Genera un id normalizado para tratar la ruta como no dirigida.
   * @param origenId Primer sistema.
   * @param destinoId Segundo sistema.
   * @returns Id estable de la ruta.
   */
  public static crearId(origenId: string, destinoId: string): string {
    return [origenId, destinoId].sort().join('__');
  }

  /**
   * Verifica si la ruta conecta dos sistemas específicos.
   * @param origenId Primer sistema.
   * @param destinoId Segundo sistema.
   * @returns true si la ruta conecta ambos sistemas.
   */
  public conecta(origenId: string, destinoId: string): boolean {
    return this.id === RutaEspacial.crearId(origenId, destinoId);
  }

  /**
   * Indica si un sistema forma parte de esta ruta.
   * @param sistemaId Id del sistema.
   * @returns true si el sistema es origen o destino.
   */
  public contieneSistema(sistemaId: string): boolean {
    return this.origenId === sistemaId || this.destinoId === sistemaId;
  }

  /**
   * Devuelve el otro extremo de la ruta.
   * @param sistemaId Sistema conocido.
   * @returns Id del sistema vecino.
   * @throws Error si el sistema no pertenece a la ruta.
   */
  public obtenerOtroExtremo(sistemaId: string): string {
    if (this.origenId === sistemaId) {
      return this.destinoId;
    }

    if (this.destinoId === sistemaId) {
      return this.origenId;
    }

    throw new Error('El sistema indicado no pertenece a esta ruta.');
  }

  /**
   * Convierte la ruta a objeto plano.
   * @returns DTO serializable de la ruta.
   */
  public toDTO(): RutaEspacialDTO {
    return {
      id: this.id,
      origenId: this.origenId,
      destinoId: this.destinoId,
      distanciaTiempo: this.distanciaTiempo,
    };
  }

  public getId(): string {
    return this.id;
  }

  public getOrigenId(): string {
    return this.origenId;
  }

  public getDestinoId(): string {
    return this.destinoId;
  }

  public getDistanciaTiempo(): number {
    return this.distanciaTiempo;
  }
}
