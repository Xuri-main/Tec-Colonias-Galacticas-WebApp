import { RecursosDTO } from '../types/gameTypes';

/**
 * Representa los tres recursos principales del juego.
 * Es una clase de valor: encapsula sumas, restas y validaciones de recursos.
 */
export class Recursos {
  private minerales: number;
  private energia: number;
  private cristales: number;

  /**
   * Crea una bolsa de recursos.
   * @param minerales Cantidad inicial de minerales. Debe ser >= 0.
   * @param energia Cantidad inicial de energía. Debe ser >= 0.
   * @param cristales Cantidad inicial de cristales. Debe ser >= 0.
   */
  constructor(minerales = 0, energia = 0, cristales = 0) {
    this.validarCantidad(minerales, 'minerales');
    this.validarCantidad(energia, 'energia');
    this.validarCantidad(cristales, 'cristales');

    this.minerales = minerales;
    this.energia = energia;
    this.cristales = cristales;
  }

  /**
   * Construye una instancia desde un objeto plano.
   * @param dto Objeto con minerales, energía y cristales.
   * @returns Nueva instancia de Recursos.
   */
  public static desdeDTO(dto: RecursosDTO): Recursos {
    return new Recursos(dto.minerales, dto.energia, dto.cristales);
  }

  /**
   * Devuelve una copia independiente para evitar mutaciones externas.
   * @returns Nueva instancia con los mismos valores.
   */
  public clonar(): Recursos {
    return new Recursos(this.minerales, this.energia, this.cristales);
  }

  /**
   * Verifica si la bolsa actual alcanza para pagar un costo.
   * @param costo Recursos requeridos.
   * @returns true si hay suficientes recursos.
   */
  public puedePagar(costo: Recursos): boolean {
    return (
      this.minerales >= costo.getMinerales() &&
      this.energia >= costo.getEnergia() &&
      this.cristales >= costo.getCristales()
    );
  }

  /**
   * Suma recursos a la bolsa actual.
   * @param recursos Recursos que se agregan.
   */
  public sumar(recursos: Recursos): void {
    this.minerales += recursos.getMinerales();
    this.energia += recursos.getEnergia();
    this.cristales += recursos.getCristales();
  }

  /**
   * Resta recursos si existen fondos suficientes.
   * @param recursos Recursos que se descuentan.
   * @throws Error si los recursos son insuficientes.
   */
  public restar(recursos: Recursos): void {
    if (!this.puedePagar(recursos)) {
      throw new Error('Recursos insuficientes para realizar la acción.');
    }

    this.minerales -= recursos.getMinerales();
    this.energia -= recursos.getEnergia();
    this.cristales -= recursos.getCristales();
  }

  /**
   * Calcula el puntaje por recursos acumulados según el enunciado:
   * mineral x1, energía x2 y cristal x3.
   * @returns Puntaje numérico.
   */
  public calcularPuntaje(): number {
    return this.minerales + this.energia * 2 + this.cristales * 3;
  }

  /**
   * Convierte la clase a un objeto serializable para API/WebSocket.
   * @returns Objeto plano de recursos.
   */
  public toDTO(): RecursosDTO {
    return {
      minerales: this.minerales,
      energia: this.energia,
      cristales: this.cristales,
    };
  }

  public getMinerales(): number {
    return this.minerales;
  }

  public getEnergia(): number {
    return this.energia;
  }

  public getCristales(): number {
    return this.cristales;
  }

  /**
   * Valida que una cantidad sea finita, entera y no negativa.
   * @param cantidad Valor a validar.
   * @param campo Nombre del campo para mensajes de error.
   */
  private validarCantidad(cantidad: number, campo: string): void {
    if (!Number.isFinite(cantidad) || cantidad < 0 || !Number.isInteger(cantidad)) {
      throw new Error(`La cantidad de ${campo} debe ser un entero mayor o igual a cero.`);
    }
  }
}
