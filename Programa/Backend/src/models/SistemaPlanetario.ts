
import { Jugador } from './Jugador';

export class SistemaPlanetario {
    private id: string;
    private nombre: string;
    private propietario: Jugador | null;
    private tasaProduccion: number;
    private recursosAcumulados: number;

    constructor(id: string, nombre: string, tasaProduccion: number = 10) {
        this.id = id;
        this.nombre = nombre;
        this.propietario = null; // Al inicio de la partida, son neutrales
        this.tasaProduccion = tasaProduccion;
        this.recursosAcumulados = 0;
    }

    public getId(): string { return this.id; }
    public getNombre(): string { return this.nombre; }
    public getPropietario(): Jugador | null { return this.propietario; }

    public conquistar(nuevoPropietario: Jugador): void {
        this.propietario = nuevoPropietario;
    }

    // Este método será llamado por el Game Loop cada X segundos
    public producirRecursos(): void {
        if (this.propietario) {
            this.recursosAcumulados += this.tasaProduccion;
            this.propietario.agregarCreditos(this.tasaProduccion);
        }
    }
}