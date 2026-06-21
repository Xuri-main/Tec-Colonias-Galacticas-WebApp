/*
    Archivo: Galaxia.ts
    Descripcion: Representa el grafo galactico compuesto por sistemas planetarios y rutas espaciales.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { RutaEspacial } from './RutaEspacial';
import { SistemaPlanetario } from './SistemaPlanetario';

export class Galaxia {
    private id: string;
    private nombre: string;
    private sistemas: Map<string, SistemaPlanetario>;
    private rutas: RutaEspacial[];

    /*
         constructor
        Entradas: Id y nombre de la galaxia.
        Salidas: Nueva instancia de Galaxia.
        Objetivo: Inicializar una galaxia vacia.
    */
    constructor(id: string, nombre: string) {
        this.id = id;
        this.nombre = nombre;
        this.sistemas = new Map<string, SistemaPlanetario>();
        this.rutas = [];
    }

    /*
         getId
        Entradas: No recibe entradas.
        Salidas: Id de la galaxia.
        Objetivo: Obtener el identificador de la galaxia.
    */
    public getId(): string {
        return this.id;
    }

    /*
         getNombre
        Entradas: No recibe entradas.
        Salidas: Nombre de la galaxia.
        Objetivo: Obtener el nombre visible de la galaxia.
    */
    public getNombre(): string {
        return this.nombre;
    }

    /*
         agregarSistema
        Entradas: Sistema planetario.
        Salidas: Verdadero si el sistema se agrego correctamente.
        Objetivo: Agregar un nodo al grafo evitando ids repetidos.
    */
    public agregarSistema(sistema: SistemaPlanetario): boolean {
        if (this.sistemas.has(sistema.getId())) {
            return false;
        }

        this.sistemas.set(sistema.getId(), sistema);
        return true;
    }

    /*
         agregarRuta
        Entradas: Id de origen, id de destino y distancia.
        Salidas: Verdadero si la ruta se agrego correctamente.
        Objetivo: Agregar una arista bidireccional entre dos sistemas existentes.
    */
    public agregarRuta(origenId: string, destinoId: string, distancia: number = 1): boolean {
        if (!this.sistemas.has(origenId) || !this.sistemas.has(destinoId)) {
            return false;
        }

        if (origenId === destinoId || this.existeRutaDirecta(origenId, destinoId)) {
            return false;
        }

        this.rutas.push(new RutaEspacial(origenId, destinoId, distancia));
        this.rutas.push(new RutaEspacial(destinoId, origenId, distancia));
        return true;
    }

    /*
         obtenerSistema
        Entradas: Id del sistema.
        Salidas: Sistema encontrado o undefined.
        Objetivo: Buscar un sistema planetario por id.
    */
    public obtenerSistema(idSistema: string): SistemaPlanetario | undefined {
        return this.sistemas.get(idSistema);
    }

    /*
         obtenerSistemas
        Entradas: No recibe entradas.
        Salidas: Lista de sistemas planetarios.
        Objetivo: Obtener todos los sistemas de la galaxia.
    */
    public obtenerSistemas(): SistemaPlanetario[] {
        return Array.from(this.sistemas.values());
    }

    /*
         obtenerRutas
        Entradas: No recibe entradas.
        Salidas: Lista de rutas espaciales.
        Objetivo: Obtener todas las rutas del grafo.
    */
    public obtenerRutas(): RutaEspacial[] {
        return this.rutas;
    }

    /*
         obtenerVecinos
        Entradas: Id del sistema.
        Salidas: Lista de sistemas conectados directamente.
        Objetivo: Obtener los vecinos directos de un sistema.
    */
    public obtenerVecinos(idSistema: string): SistemaPlanetario[] {
        const vecinos: SistemaPlanetario[] = [];

        for (const ruta of this.rutas) {
            if (ruta.getOrigenId() === idSistema) {
                const destino = this.obtenerSistema(ruta.getDestinoId());

                if (destino) {
                    vecinos.push(destino);
                }
            }
        }

        return vecinos;
    }

    /*
         existeRutaDirecta
        Entradas: Id de origen e id de destino.
        Salidas: Verdadero si existe ruta directa.
        Objetivo: Validar movimientos entre sistemas conectados directamente.
    */
    public existeRutaDirecta(origenId: string, destinoId: string): boolean {
        return this.rutas.some((ruta) => ruta.conecta(origenId, destinoId));
    }

    /*
         contarSistemasControladosPor
        Entradas: Id del jugador.
        Salidas: Cantidad de sistemas controlados.
        Objetivo: Calcular el territorio controlado por un jugador.
    */
    public contarSistemasControladosPor(jugadorId: string): number {
        return this.obtenerSistemas().filter((sistema) => sistema.estaControladoPor(jugadorId)).length;
    }

    /*
         clonar
        Entradas: No recibe entradas.
        Salidas: Copia nueva de la galaxia.
        Objetivo: Crear una galaxia independiente para una partida.
    */
    public clonar(): Galaxia {
        const copia = new Galaxia(this.id, this.nombre);

        for (const sistema of this.obtenerSistemas()) {
            copia.agregarSistema(sistema.clonar());
        }

        for (const ruta of this.rutas) {
            if (ruta.getOrigenId() < ruta.getDestinoId()) {
                copia.agregarRuta(ruta.getOrigenId(), ruta.getDestinoId(), ruta.getDistancia());
            }
        }

        return copia;
    }

    /*
         toJSON
        Entradas: No recibe entradas.
        Salidas: Objeto simple con la galaxia.
        Objetivo: Preparar la galaxia para enviarla al cliente.
    */
    public toJSON(): object {
        return {
            id: this.id,
            nombre: this.nombre,
            sistemas: this.obtenerSistemas().map((sistema) => sistema.toJSON()),
            rutas: this.rutas
                .filter((ruta) => ruta.getOrigenId() < ruta.getDestinoId())
                .map((ruta) => ruta.toJSON())
        };
    }
}
