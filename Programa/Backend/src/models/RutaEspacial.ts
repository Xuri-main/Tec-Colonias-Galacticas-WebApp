
import { SistemaPlanetario } from './SistemaPlanetario';

export class RutaEspacial {
    private origen: SistemaPlanetario;
    private destino: SistemaPlanetario;
    private distanciaTiempo: number; // Tiempo que toma viajar por aquí

    constructor(origen: SistemaPlanetario, destino: SistemaPlanetario, distanciaTiempo: number) {
        this.origen = origen;
        this.destino = destino;
        this.distanciaTiempo = distanciaTiempo;
    }

    public getOrigen(): SistemaPlanetario { return this.origen; }
    public getDestino(): SistemaPlanetario { return this.destino; }
    public getDistancia(): number { return this.distanciaTiempo; }
}