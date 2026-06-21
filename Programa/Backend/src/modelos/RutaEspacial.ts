/*
    Archivo: RutaEspacial.ts
    Descripcion: Representa una conexion entre dos sistemas planetarios.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

export class RutaEspacial {
    private origenId: string;
    private destinoId: string;
    private distancia: number;

    /*
         constructor
        Entradas: Id de origen, id de destino y distancia.
        Salidas: Nueva instancia de RutaEspacial.
        Objetivo: Inicializar una ruta espacial del grafo.
    */
    constructor(origenId: string, destinoId: string, distancia: number = 1) {
        this.origenId = origenId;
        this.destinoId = destinoId;
        this.distancia = Math.max(1, distancia);
    }

    /*
         getOrigenId
        Entradas: No recibe entradas.
        Salidas: Id del sistema de origen.
        Objetivo: Obtener el origen de la ruta.
    */
    public getOrigenId(): string {
        return this.origenId;
    }

    /*
         getDestinoId
        Entradas: No recibe entradas.
        Salidas: Id del sistema de destino.
        Objetivo: Obtener el destino de la ruta.
    */
    public getDestinoId(): string {
        return this.destinoId;
    }

    /*
         getDistancia
        Entradas: No recibe entradas.
        Salidas: Distancia de la ruta.
        Objetivo: Obtener el costo o distancia de viaje entre sistemas.
    */
    public getDistancia(): number {
        return this.distancia;
    }

    /*
         conecta
        Entradas: Dos ids de sistemas.
        Salidas: Verdadero si la ruta conecta ambos sistemas.
        Objetivo: Validar si dos sistemas estan conectados directamente.
    */
    public conecta(origenId: string, destinoId: string): boolean {
        return this.origenId === origenId && this.destinoId === destinoId;
    }

    /*
         clonar
        Entradas: No recibe entradas.
        Salidas: Copia nueva de la ruta.
        Objetivo: Crear una copia independiente de la ruta espacial.
    */
    public clonar(): RutaEspacial {
        return new RutaEspacial(this.origenId, this.destinoId, this.distancia);
    }

    /*
         toJSON
        Entradas: No recibe entradas.
        Salidas: Objeto simple con los datos de la ruta.
        Objetivo: Preparar la ruta para API y WebSocket.
    */
    public toJSON(): object {
        return {
            origenId: this.origenId,
            destinoId: this.destinoId,
            distancia: this.distancia
        };
    }
}
