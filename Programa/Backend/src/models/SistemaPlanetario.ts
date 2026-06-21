import { Recursos } from './Recursos';
import {
  ConteoInstalaciones,
  EstadoExploracion,
  SistemaPlanetarioDTO,
  TipoInstalacion,
  TipoSistema,
} from '../types/gameTypes';
import { gameConfig } from '../config/gameConfig';

interface SistemaPlanetarioParams {
  id: string;
  nombre: string;
  tipo: TipoSistema;
  descripcion?: string;
  produccionPorCiclo: Recursos;
  propietarioId?: string | null;
  flotasEstacionadas?: number;
  instalaciones?: Partial<ConteoInstalaciones>;
  estadoExploracion?: EstadoExploracion;
}

/**
 * Nodo del grafo galáctico.
 * Contiene la información jugable de cada sistema: recursos, propietario,
 * flotas, instalaciones y estado de exploración.
 */
export class SistemaPlanetario {
  private readonly id: string;
  private readonly nombre: string;
  private readonly descripcion: string;
  private readonly tipo: TipoSistema;
  private propietarioId: string | null;
  private estadoExploracion: EstadoExploracion;
  private flotasEstacionadas: number;
  private readonly instalaciones: ConteoInstalaciones;
  private readonly produccionPorCiclo: Recursos;

  /**
   * Crea un sistema planetario.
   * @param params Datos obligatorios y opcionales del sistema.
   */
  constructor(params: SistemaPlanetarioParams) {
    if (!params.id.trim()) {
      throw new Error('El id del sistema planetario es obligatorio.');
    }

    if (!params.nombre.trim()) {
      throw new Error('El nombre del sistema planetario es obligatorio.');
    }

    this.id = params.id;
    this.nombre = params.nombre;
    this.tipo = params.tipo;
    this.descripcion =
      params.descripcion?.trim() ||
      `Sistema ${params.nombre} de tipo ${params.tipo}.`;

    this.propietarioId = params.propietarioId ?? null;
    this.estadoExploracion =
      params.estadoExploracion ?? (this.propietarioId ? 'controlado' : 'no_explorado');
    this.flotasEstacionadas = params.flotasEstacionadas ?? 0;

    this.validarCantidadEntera(this.flotasEstacionadas, 'flotas estacionadas');

    this.instalaciones = {
      mina: params.instalaciones?.mina ?? 0,
      centralInvestigacion: params.instalaciones?.centralInvestigacion ?? 0,
      astillero: params.instalaciones?.astillero ?? 0,
      fortaleza: params.instalaciones?.fortaleza ?? 0,
    };

    Object.entries(this.instalaciones).forEach(([campo, cantidad]) =>
      this.validarCantidadEntera(cantidad, campo),
    );

    this.produccionPorCiclo = params.produccionPorCiclo.clonar();
  }

  /**
   * Marca el sistema como controlado por un jugador.
   * @param jugadorId Id del nuevo propietario.
   * @param flotasIniciales Flotas que quedan estacionadas al conquistar o colonizar.
   */
  public controlar(jugadorId: string, flotasIniciales = 0): void {
    if (!jugadorId.trim()) {
      throw new Error('El id del propietario es obligatorio.');
    }

    this.validarCantidadEntera(flotasIniciales, 'flotas iniciales');
    this.propietarioId = jugadorId;
    this.estadoExploracion = 'controlado';
    this.flotasEstacionadas = flotasIniciales;
  }

  /**
   * Libera el sistema y lo deja sin propietario.
   */
  public liberar(): void {
    this.propietarioId = null;
    this.estadoExploracion = 'no_explorado';
    this.flotasEstacionadas = 0;
  }

  /**
   * Construye una instalación dentro del sistema.
   * @param tipo Tipo de instalación a construir.
   */
  public construirInstalacion(tipo: TipoInstalacion): void {
    this.instalaciones[tipo] += 1;

    if (tipo === 'astillero') {
      this.flotasEstacionadas += 1;
    }
  }

  /**
   * Agrega flotas estacionadas al sistema.
   * @param cantidad Número de flotas a agregar.
   */
  public agregarFlotas(cantidad: number): void {
    this.validarCantidadEntera(cantidad, 'cantidad de flotas a agregar');
    this.flotasEstacionadas += cantidad;
  }

  /**
   * Remueve flotas estacionadas del sistema.
   * @param cantidad Número de flotas a remover.
   * @throws Error si no hay suficientes flotas.
   */
  public removerFlotas(cantidad: number): void {
    this.validarCantidadEntera(cantidad, 'cantidad de flotas a remover');

    if (cantidad > this.flotasEstacionadas) {
      throw new Error('No hay suficientes flotas estacionadas en el sistema.');
    }

    this.flotasEstacionadas -= cantidad;
  }

  /**
   * Reduce minas, fortalezas y flotas como resultado de un combate.
   * @param perdidas Cantidades a descontar.
   */
  public aplicarPerdidas(perdidas: Partial<ConteoInstalaciones & { flotas: number }>): void {
    const flotasPerdidas = perdidas.flotas ?? 0;
    this.validarCantidadEntera(flotasPerdidas, 'flotas perdidas');

    if (flotasPerdidas > this.flotasEstacionadas) {
      this.flotasEstacionadas = 0;
    } else {
      this.flotasEstacionadas -= flotasPerdidas;
    }

    (['mina', 'centralInvestigacion', 'astillero', 'fortaleza'] as TipoInstalacion[]).forEach(
      (tipo) => {
        const cantidad = perdidas[tipo] ?? 0;
        this.validarCantidadEntera(cantidad, `pérdidas de ${tipo}`);
        this.instalaciones[tipo] = Math.max(0, this.instalaciones[tipo] - cantidad);
      },
    );
  }

  /**
   * Calcula la producción total del sistema para un ciclo.
   * Incluye la producción base por tipo de planeta y la producción de centrales.
   * @returns Recursos generados en el ciclo.
   */
  public calcularProduccion(): Recursos {
    const produccion = this.produccionPorCiclo.clonar();

    for (let i = 0; i < this.instalaciones.centralInvestigacion; i += 1) {
      produccion.sumar(gameConfig.produccionPorCentral);
    }

    return produccion;
  }

  /**
   * Indica si el sistema pertenece a un jugador.
   * @param jugadorId Id del jugador consultado.
   * @returns true si el jugador controla el sistema.
   */
  public esControladoPor(jugadorId: string): boolean {
    return this.propietarioId === jugadorId;
  }

  /**
   * Crea una copia independiente del sistema para una nueva partida.
   * @returns Nuevo SistemaPlanetario con el mismo estado.
   */
  public clonar(): SistemaPlanetario {
    return new SistemaPlanetario({
      id: this.id,
      nombre: this.nombre,
      tipo: this.tipo,
      descripcion: this.descripcion,
      produccionPorCiclo: this.produccionPorCiclo,
      propietarioId: this.propietarioId,
      flotasEstacionadas: this.flotasEstacionadas,
      instalaciones: { ...this.instalaciones },
      estadoExploracion: this.estadoExploracion,
    });
  }

  /**
   * Convierte el sistema a objeto plano para API/WebSocket.
   * @returns DTO serializable del sistema.
   */
  public toDTO(): SistemaPlanetarioDTO {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      tipo: this.tipo,
      propietarioId: this.propietarioId,
      estadoExploracion: this.estadoExploracion,
      produccionPorCiclo: this.calcularProduccion().toDTO(),
      flotasEstacionadas: this.flotasEstacionadas,
      instalaciones: { ...this.instalaciones },
    };
  }

  public getId(): string {
    return this.id;
  }

  public getNombre(): string {
    return this.nombre;
  }

  public getDescripcion(): string {
    return this.descripcion;
  }

  public getTipo(): TipoSistema {
    return this.tipo;
  }

  public getPropietarioId(): string | null {
    return this.propietarioId;
  }

  public getEstadoExploracion(): EstadoExploracion {
    return this.estadoExploracion;
  }

  public getFlotasEstacionadas(): number {
    return this.flotasEstacionadas;
  }

  public getInstalaciones(): ConteoInstalaciones {
    return { ...this.instalaciones };
  }

  /**
   * Valida que una cantidad sea entera y no negativa.
   * @param cantidad Valor a validar.
   * @param campo Nombre del campo para mensajes de error.
   */
  private validarCantidadEntera(cantidad: number, campo: string): void {
    if (!Number.isInteger(cantidad) || cantidad < 0) {
      throw new Error(`La cantidad de ${campo} debe ser un entero mayor o igual a cero.`);
    }
  }
}
