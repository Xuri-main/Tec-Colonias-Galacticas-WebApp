/*
    Archivo: SistemaPlanetario.ts
    Descripcion: Representa un sistema planetario del grafo de la galaxia.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { EstadoExploracion, TipoConstruccion, TipoPlaneta } from '../tipos/tiposJuego';

export class SistemaPlanetario {
    private id: string;
    private nombre: string;
    private descripcion: string;
    private tipo: TipoPlaneta;
    private propietarioId: string | null;
    private flotas: number;
    private minas: number;
    private centrosInvestigacion: number;
    private astilleros: number;
    private fortalezas: number;
    private estadoExploracion: EstadoExploracion;

    /*
         constructor
        Entradas: id, nombre, descripcion y tipo del planeta.
        Salidas: Nueva instancia de SistemaPlanetario.
        Objetivo: Inicializar un sistema planetario sin propietario.
    */
    constructor(id: string, nombre: string, descripcion: string, tipo: TipoPlaneta) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.tipo = tipo;
        this.propietarioId = null;
        this.flotas = 0;
        this.minas = 0;
        this.centrosInvestigacion = 0;
        this.astilleros = 0;
        this.fortalezas = 0;
        this.estadoExploracion = 'noExplorado';
    }

    /*
         getId
        Entradas: No recibe entradas.
        Salidas: Id del sistema.
        Objetivo: Obtener el identificador del sistema planetario.
    */
    public getId(): string {
        return this.id;
    }

    /*
         getNombre
        Entradas: No recibe entradas.
        Salidas: Nombre del sistema.
        Objetivo: Obtener el nombre visible del sistema planetario.
    */
    public getNombre(): string {
        return this.nombre;
    }

    /*
         getDescripcion
        Entradas: No recibe entradas.
        Salidas: Descripcion del sistema.
        Objetivo: Obtener la descripcion del sistema planetario.
    */
    public getDescripcion(): string {
        return this.descripcion;
    }

    /*
         getTipo
        Entradas: No recibe entradas.
        Salidas: Tipo del planeta.
        Objetivo: Obtener el tipo usado para calcular produccion.
    */
    public getTipo(): TipoPlaneta {
        return this.tipo;
    }

    /*
         getPropietarioId
        Entradas: No recibe entradas.
        Salidas: Id del propietario o null.
        Objetivo: Consultar quien controla el sistema planetario.
    */
    public getPropietarioId(): string | null {
        return this.propietarioId;
    }

    /*
         getFlotas
        Entradas: No recibe entradas.
        Salidas: Cantidad de flotas.
        Objetivo: Obtener las flotas estacionadas en el sistema.
    */
    public getFlotas(): number {
        return this.flotas;
    }

    /*
         getMinas
        Entradas: No recibe entradas.
        Salidas: Cantidad de minas.
        Objetivo: Obtener las minas construidas en el sistema.
    */
    public getMinas(): number {
        return this.minas;
    }

    /*
         getCentrosInvestigacion
        Entradas: No recibe entradas.
        Salidas: Cantidad de centros de investigacion.
        Objetivo: Obtener los centros construidos en el sistema.
    */
    public getCentrosInvestigacion(): number {
        return this.centrosInvestigacion;
    }

    /*
         getAstilleros
        Entradas: No recibe entradas.
        Salidas: Cantidad de astilleros.
        Objetivo: Obtener los astilleros construidos en el sistema.
    */
    public getAstilleros(): number {
        return this.astilleros;
    }

    /*
         getFortalezas
        Entradas: No recibe entradas.
        Salidas: Cantidad de fortalezas.
        Objetivo: Obtener las fortalezas construidas en el sistema.
    */
    public getFortalezas(): number {
        return this.fortalezas;
    }

    /*
         estaControladoPor
        Entradas: Id del jugador.
        Salidas: Verdadero si el jugador controla el sistema.
        Objetivo: Validar propiedad antes de construir o mover flotas.
    */
    public estaControladoPor(jugadorId: string): boolean {
        return this.propietarioId === jugadorId;
    }

    /*
         cambiarPropietario
        Entradas: Id del nuevo propietario o null.
        Salidas: No retorna valor.
        Objetivo: Cambiar el control del sistema planetario.
    */
    public cambiarPropietario(jugadorId: string | null): void {
        this.propietarioId = jugadorId;
        this.estadoExploracion = jugadorId ? 'controlado' : 'noExplorado';
    }

    /*
         agregarFlotas
        Entradas: Cantidad de flotas a agregar.
        Salidas: No retorna valor.
        Objetivo: Aumentar las flotas estacionadas en el sistema.
    */
    public agregarFlotas(cantidad: number): void {
        if (cantidad > 0) {
            this.flotas += cantidad;
        }
    }

    /*
         quitarFlotas
        Entradas: Cantidad de flotas a retirar.
        Salidas: Verdadero si se pudieron retirar.
        Objetivo: Restar flotas al moverlas o usarlas en combate.
    */
    public quitarFlotas(cantidad: number): boolean {
        if (cantidad <= 0 || cantidad > this.flotas) {
            return false;
        }

        this.flotas -= cantidad;
        return true;
    }

    /*
         construir
        Entradas: Tipo de construccion.
        Salidas: No retorna valor.
        Objetivo: Aumentar la infraestructura del sistema controlado.
    */
    public construir(tipoConstruccion: TipoConstruccion): void {
        if (tipoConstruccion === 'mina') {
            this.minas++;
        }

        if (tipoConstruccion === 'centroInvestigacion') {
            this.centrosInvestigacion++;
        }

        if (tipoConstruccion === 'astillero') {
            this.astilleros++;
            this.flotas++;
        }

        if (tipoConstruccion === 'fortaleza') {
            this.fortalezas++;
        }
    }

    /*
         descontarDefensas
        Entradas: Minas, fortalezas y flotas a descontar.
        Salidas: No retorna valor.
        Objetivo: Restar defensas utilizadas durante un combate.
    */
    public descontarDefensas(minas: number, fortalezas: number, flotas: number): void {
        this.minas = Math.max(0, this.minas - minas);
        this.fortalezas = Math.max(0, this.fortalezas - fortalezas);
        this.flotas = Math.max(0, this.flotas - flotas);
    }

    /*
         clonar
        Entradas: No recibe entradas.
        Salidas: Copia nueva del sistema planetario.
        Objetivo: Crear una copia independiente para cada partida.
    */
    public clonar(): SistemaPlanetario {
        const copia = new SistemaPlanetario(this.id, this.nombre, this.descripcion, this.tipo);
        copia.propietarioId = this.propietarioId;
        copia.flotas = this.flotas;
        copia.minas = this.minas;
        copia.centrosInvestigacion = this.centrosInvestigacion;
        copia.astilleros = this.astilleros;
        copia.fortalezas = this.fortalezas;
        copia.estadoExploracion = this.estadoExploracion;
        return copia;
    }

    /*
         toJSON
        Entradas: No recibe entradas.
        Salidas: Objeto simple con los datos del sistema.
        Objetivo: Preparar los datos del sistema para API y WebSocket.
    */
    public toJSON(): object {
        return {
            id: this.id,
            nombre: this.nombre,
            descripcion: this.descripcion,
            tipo: this.tipo,
            propietarioId: this.propietarioId,
            flotas: this.flotas,
            instalaciones: {
                minas: this.minas,
                centrosInvestigacion: this.centrosInvestigacion,
                astilleros: this.astilleros,
                fortalezas: this.fortalezas
            },
            estadoExploracion: this.estadoExploracion
        };
    }
}
