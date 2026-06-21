/*
    Archivo: Recursos.ts
    Descripcion: Representa los recursos principales utilizados por los jugadores y sistemas planetarios.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

export class Recursos {
    private minerales: number;
    private energia: number;
    private cristales: number;

    /*
         constructor
        Entradas: minerales, energia y cristales iniciales.
        Salidas: Nueva instancia de Recursos.
        Objetivo: Inicializar una cantidad de recursos validando que no sean negativos.
    */
    constructor(minerales: number = 0, energia: number = 0, cristales: number = 0) {
        this.minerales = Math.max(0, minerales);
        this.energia = Math.max(0, energia);
        this.cristales = Math.max(0, cristales);
    }

    /*
         getMinerales
        Entradas: No recibe entradas.
        Salidas: Cantidad de minerales.
        Objetivo: Obtener los minerales disponibles.
    */
    public getMinerales(): number {
        return this.minerales;
    }

    /*
         getEnergia
        Entradas: No recibe entradas.
        Salidas: Cantidad de energia.
        Objetivo: Obtener la energia disponible.
    */
    public getEnergia(): number {
        return this.energia;
    }

    /*
         getCristales
        Entradas: No recibe entradas.
        Salidas: Cantidad de cristales.
        Objetivo: Obtener los cristales disponibles.
    */
    public getCristales(): number {
        return this.cristales;
    }

    /*
         puedePagar
        Entradas: Costo que se desea pagar.
        Salidas: Verdadero si alcanza para pagar, falso en caso contrario.
        Objetivo: Validar si los recursos actuales cubren un costo.
    */
    public puedePagar(costo: Recursos): boolean {
        return this.minerales >= costo.getMinerales()
            && this.energia >= costo.getEnergia()
            && this.cristales >= costo.getCristales();
    }

    /*
         sumar
        Entradas: Recursos que se desean agregar.
        Salidas: No retorna valor.
        Objetivo: Aumentar los recursos actuales.
    */
    public sumar(recursos: Recursos): void {
        this.minerales += recursos.getMinerales();
        this.energia += recursos.getEnergia();
        this.cristales += recursos.getCristales();
    }

    /*
         restar
        Entradas: Recursos que se desean descontar.
        Salidas: Verdadero si se pudo restar, falso si no hay suficientes recursos.
        Objetivo: Descontar recursos despues de una compra o accion.
    */
    public restar(recursos: Recursos): boolean {
        if (!this.puedePagar(recursos)) {
            return false;
        }

        this.minerales -= recursos.getMinerales();
        this.energia -= recursos.getEnergia();
        this.cristales -= recursos.getCristales();
        return true;
    }

    /*
         clonar
        Entradas: No recibe entradas.
        Salidas: Copia nueva de los recursos.
        Objetivo: Crear una copia para evitar modificar el objeto original.
    */
    public clonar(): Recursos {
        return new Recursos(this.minerales, this.energia, this.cristales);
    }

    /*
         obtenerPuntaje
        Entradas: No recibe entradas.
        Salidas: Puntaje calculado por recursos.
        Objetivo: Calcular el puntaje segun minerales, energia y cristales acumulados.
    */
    public obtenerPuntaje(): number {
        return this.minerales + (this.energia * 2) + (this.cristales * 3);
    }

    /*
         toJSON
        Entradas: No recibe entradas.
        Salidas: Objeto simple con los recursos.
        Objetivo: Preparar los datos para enviarlos por API o WebSocket.
    */
    public toJSON(): object {
        return {
            minerales: this.minerales,
            energia: this.energia,
            cristales: this.cristales
        };
    }
}
