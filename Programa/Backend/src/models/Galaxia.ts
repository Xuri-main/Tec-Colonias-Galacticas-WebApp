import { RutaEspacial } from './RutaEspacial';
import { SistemaPlanetario } from './SistemaPlanetario';
import { GalaxiaDTO } from '../types/gameTypes';

/**
 * Representa el universo galáctico como un grafo no dirigido.
 * Cada SistemaPlanetario es un nodo y cada RutaEspacial es una arista.
 */
export class Galaxia {
  private readonly id: string;
  private readonly nombre: string;
  private readonly sistemas: Map<string, SistemaPlanetario>;
  private readonly rutas: Map<string, RutaEspacial>;

  /**
   * Crea una galaxia vacía.
   * @param id Identificador interno de la galaxia.
   * @param nombre Nombre visible de la galaxia.
   */
  constructor(id: string, nombre: string) {
    if (!id.trim()) {
      throw new Error('El id de la galaxia es obligatorio.');
    }

    if (!nombre.trim()) {
      throw new Error('El nombre de la galaxia es obligatorio.');
    }

    this.id = id;
    this.nombre = nombre;
    this.sistemas = new Map<string, SistemaPlanetario>();
    this.rutas = new Map<string, RutaEspacial>();
  }

  /**
   * Agrega un sistema planetario al grafo.
   * @param sistema Sistema a agregar.
   * @throws Error si el sistema ya existe.
   */
  public agregarSistema(sistema: SistemaPlanetario): void {
    if (this.sistemas.has(sistema.getId())) {
      throw new Error(`El sistema ${sistema.getId()} ya existe en la galaxia.`);
    }

    this.sistemas.set(sistema.getId(), sistema);
  }

  /**
   * Agrega una ruta no dirigida entre dos sistemas existentes.
   * @param origenId Id del primer sistema.
   * @param destinoId Id del segundo sistema.
   * @param distanciaTiempo Peso o tiempo de viaje.
   * @throws Error si los sistemas no existen o la ruta está duplicada.
   */
  public agregarRuta(origenId: string, destinoId: string, distanciaTiempo = 1): void {
    if (!this.sistemas.has(origenId)) {
      throw new Error(`No existe el sistema origen ${origenId}.`);
    }

    if (!this.sistemas.has(destinoId)) {
      throw new Error(`No existe el sistema destino ${destinoId}.`);
    }

    const ruta = new RutaEspacial(origenId, destinoId, distanciaTiempo);

    if (this.rutas.has(ruta.getId())) {
      throw new Error(`La ruta ${origenId} - ${destinoId} ya existe.`);
    }

    this.rutas.set(ruta.getId(), ruta);
  }

  /**
   * Busca un sistema por id.
   * @param id Id del sistema.
   * @returns Sistema encontrado o undefined.
   */
  public obtenerSistema(id: string): SistemaPlanetario | undefined {
    return this.sistemas.get(id);
  }

  /**
   * Obtiene todos los sistemas del grafo.
   * @returns Lista de sistemas planetarios.
   */
  public obtenerTodosLosSistemas(): SistemaPlanetario[] {
    return Array.from(this.sistemas.values());
  }

  /**
   * Obtiene todas las rutas del grafo.
   * @returns Lista de rutas espaciales.
   */
  public obtenerTodasLasRutas(): RutaEspacial[] {
    return Array.from(this.rutas.values());
  }

  /**
   * Obtiene los sistemas vecinos conectados directamente.
   * @param sistemaId Id del sistema origen.
   * @returns Lista de sistemas adyacentes.
   */
  public obtenerSistemasAdyacentes(sistemaId: string): SistemaPlanetario[] {
    this.validarSistemaExistente(sistemaId);

    return this.obtenerVecinosIds(sistemaId).map((id) => {
      const sistema = this.sistemas.get(id);

      if (!sistema) {
        throw new Error(`Inconsistencia del grafo: no existe el sistema vecino ${id}.`);
      }

      return sistema;
    });
  }

  /**
   * Obtiene los ids de sistemas vecinos conectados directamente.
   * @param sistemaId Id del sistema origen.
   * @returns Lista de ids adyacentes.
   */
  public obtenerVecinosIds(sistemaId: string): string[] {
    this.validarSistemaExistente(sistemaId);

    return Array.from(this.rutas.values())
      .filter((ruta) => ruta.contieneSistema(sistemaId))
      .map((ruta) => ruta.obtenerOtroExtremo(sistemaId));
  }

  /**
   * Valida si dos sistemas tienen ruta directa.
   * @param origenId Sistema origen.
   * @param destinoId Sistema destino.
   * @returns true si existe una arista directa.
   */
  public existeRutaDirecta(origenId: string, destinoId: string): boolean {
    return this.rutas.has(RutaEspacial.crearId(origenId, destinoId));
  }

  /**
   * Busca si existe un camino entre dos sistemas usando BFS.
   * Permite filtrar qué sistemas se pueden atravesar, útil para validar terceros.
   * @param origenId Sistema origen.
   * @param destinoId Sistema destino.
   * @param puedeAtravesar Función opcional que indica si un sistema puede atravesarse.
   * @returns true si existe camino.
   */
  public existeCamino(
    origenId: string,
    destinoId: string,
    puedeAtravesar: (sistema: SistemaPlanetario) => boolean = () => true,
  ): boolean {
    this.validarSistemaExistente(origenId);
    this.validarSistemaExistente(destinoId);

    const visitados = new Set<string>();
    const cola: string[] = [origenId];

    while (cola.length > 0) {
      const actualId = cola.shift() as string;

      if (actualId === destinoId) {
        return true;
      }

      if (visitados.has(actualId)) {
        continue;
      }

      visitados.add(actualId);

      for (const vecinoId of this.obtenerVecinosIds(actualId)) {
        if (visitados.has(vecinoId)) {
          continue;
        }

        const vecino = this.sistemas.get(vecinoId);

        if (vecino && puedeAtravesar(vecino)) {
          cola.push(vecinoId);
        }
      }
    }

    return false;
  }

  /**
   * Cuenta cuántos sistemas controla un jugador.
   * @param jugadorId Id del jugador.
   * @returns Cantidad de sistemas controlados.
   */
  public contarSistemasControladosPor(jugadorId: string): number {
    return this.obtenerTodosLosSistemas().filter((sistema) =>
      sistema.esControladoPor(jugadorId),
    ).length;
  }

  /**
   * Calcula el porcentaje de sistemas controlados por un jugador.
   * @param jugadorId Id del jugador.
   * @returns Porcentaje entre 0 y 100.
   */
  public calcularPorcentajeControl(jugadorId: string): number {
    const total = this.sistemas.size;

    if (total === 0) {
      return 0;
    }

    return (this.contarSistemasControladosPor(jugadorId) / total) * 100;
  }

  /**
   * Retorna los sistemas sin propietario.
   * @returns Lista de sistemas libres.
   */
  public obtenerSistemasLibres(): SistemaPlanetario[] {
    return this.obtenerTodosLosSistemas().filter(
      (sistema) => sistema.getPropietarioId() === null,
    );
  }

  /**
   * Crea una copia independiente de la galaxia para una partida.
   * @returns Nueva galaxia con sus sistemas y rutas clonadas.
   */
  public clonarParaPartida(): Galaxia {
    const copia = new Galaxia(this.id, this.nombre);

    this.obtenerTodosLosSistemas().forEach((sistema) => copia.agregarSistema(sistema.clonar()));
    this.obtenerTodasLasRutas().forEach((ruta) =>
      copia.agregarRuta(ruta.getOrigenId(), ruta.getDestinoId(), ruta.getDistanciaTiempo()),
    );

    return copia;
  }

  /**
   * Convierte la galaxia a objeto plano.
   * @returns DTO serializable.
   */
  public toDTO(): GalaxiaDTO {
    return {
      id: this.id,
      nombre: this.nombre,
      sistemas: this.obtenerTodosLosSistemas().map((sistema) => sistema.toDTO()),
      rutas: this.obtenerTodasLasRutas().map((ruta) => ruta.toDTO()),
    };
  }

  public getId(): string {
    return this.id;
  }

  public getNombre(): string {
    return this.nombre;
  }

  /**
   * Valida que un sistema exista en la galaxia.
   * @param sistemaId Id a validar.
   * @throws Error si el sistema no existe.
   */
  private validarSistemaExistente(sistemaId: string): void {
    if (!this.sistemas.has(sistemaId)) {
      throw new Error(`El sistema ${sistemaId} no existe en la galaxia.`);
    }
  }
}
