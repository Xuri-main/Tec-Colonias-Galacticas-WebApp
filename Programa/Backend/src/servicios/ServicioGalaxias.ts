/*
    Archivo: ServicioGalaxias.ts
    Descripcion: Contiene la logica para consultar galaxias disponibles.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { Galaxia } from '../modelos/Galaxia';
import { RepositorioGalaxias } from '../repositorios/RepositorioGalaxias';

export class ServicioGalaxias {
    private repositorioGalaxias: RepositorioGalaxias;

    /*
         constructor
        Entradas: Repositorio de galaxias.
        Salidas: Nueva instancia de ServicioGalaxias.
        Objetivo: Inicializar el servicio con acceso a los archivos de galaxias.
    */
    constructor(repositorioGalaxias: RepositorioGalaxias) {
        this.repositorioGalaxias = repositorioGalaxias;
    }

    /*
         listarGalaxias
        Entradas: No recibe entradas.
        Salidas: Lista de galaxias.
        Objetivo: Obtener las galaxias disponibles para crear partidas.
    */
    public listarGalaxias(): Galaxia[] {
        return this.repositorioGalaxias.listarGalaxias();
    }

    /*
         obtenerGalaxiaPorId
        Entradas: Id de la galaxia.
        Salidas: Galaxia encontrada.
        Objetivo: Obtener una galaxia especifica validando que exista.
    */
    public obtenerGalaxiaPorId(idGalaxia: string): Galaxia {
        const galaxia = this.repositorioGalaxias.obtenerGalaxiaPorId(idGalaxia);

        if (!galaxia) {
            throw new Error('Galaxia no encontrada.');
        }

        return galaxia;
    }
}
