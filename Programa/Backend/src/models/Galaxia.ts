
import { SistemaPlanetario } from './SistemaPlanetario';
import { RutaEspacial } from './RutaEspacial';

export class Galaxia {
    private sistemas: Map<string, SistemaPlanetario>;
    private rutas: RutaEspacial[];

    constructor() {
        this.sistemas = new Map<string, SistemaPlanetario>();
        this.rutas = [];
    }

    public agregarSistema(sistema: SistemaPlanetario): void {
        if (!this.sistemas.has(sistema.getId())) {
            this.sistemas.set(sistema.getId(), sistema);
        }
    }

    public agregarRuta(origenId: string, destinoId: string, distancia: number): void {
        const origen = this.sistemas.get(origenId);
        const destino = this.sistemas.get(destinoId);

        if (origen && destino) {
            // Es un grafo bidireccional, se puede ir y volver
            this.rutas.push(new RutaEspacial(origen, destino, distancia));
            this.rutas.push(new RutaEspacial(destino, origen, distancia));
        }
    }

    public obtenerSistema(id: string): SistemaPlanetario | undefined {
        return this.sistemas.get(id);
    }

    public obtenerTodosLosSistemas(): SistemaPlanetario[] {
        return Array.from(this.sistemas.values());
    }

    public obtenerSistemasAdyacentes(idSistema: string): SistemaPlanetario[] {
        return this.rutas
            .filter(ruta => ruta.getOrigen().getId() === idSistema)
            .map(ruta => ruta.getDestino());
    }
}