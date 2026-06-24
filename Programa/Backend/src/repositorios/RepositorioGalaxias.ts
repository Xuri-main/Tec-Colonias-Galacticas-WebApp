/*
    Archivo: RepositorioGalaxias.ts
    Descripcion: Lee las galaxias almacenadas en archivos JSON y las convierte en objetos del sistema.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import fs from 'fs';
import path from 'path';
import { Galaxia } from '../modelos/Galaxia';
import { SistemaPlanetario } from '../modelos/SistemaPlanetario';
import { DatosGalaxiaJson } from '../tipos/tiposJuego';

export class RepositorioGalaxias {
    private carpetaGalaxias: string;

    /*
         constructor
        Entradas: No recibe entradas.
        Salidas: Nueva instancia de RepositorioGalaxias.
        Objetivo: Definir la carpeta donde se almacenan las galaxias.
    */
    constructor() {
        this.carpetaGalaxias = path.join(process.cwd(), 'src', 'datos', 'galaxias');
    }

    /*
         listarGalaxias
        Entradas: No recibe entradas.
        Salidas: Lista de galaxias disponibles.
        Objetivo: Leer todas las galaxias guardadas en archivos JSON.
    */
    public listarGalaxias(): Galaxia[] {
        if (!fs.existsSync(this.carpetaGalaxias)) {
            return [];
        }

        const archivos = fs.readdirSync(this.carpetaGalaxias).filter((archivo) => archivo.endsWith('.json'));
        const galaxias: Galaxia[] = [];

        for (const archivo of archivos) {
            galaxias.push(this.cargarGalaxiaDesdeArchivo(archivo));
        }

        return galaxias;
    }

    /*
         obtenerGalaxiaPorId
        Entradas: Id de la galaxia.
        Salidas: Galaxia encontrada o undefined.
        Objetivo: Buscar una galaxia disponible por su identificador.
    */
    public obtenerGalaxiaPorId(idGalaxia: string): Galaxia | undefined {
        const galaxias = this.listarGalaxias();
        return galaxias.find((galaxia) => galaxia.getId() === idGalaxia);
    }

    /*
         cargarGalaxiaDesdeArchivo
        Entradas: Nombre del archivo JSON.
        Salidas: Galaxia cargada.
        Objetivo: Leer y convertir un archivo JSON en una instancia de Galaxia.
    */
    private cargarGalaxiaDesdeArchivo(nombreArchivo: string): Galaxia {
        const rutaArchivo = path.join(this.carpetaGalaxias, nombreArchivo);
        const contenido = fs.readFileSync(rutaArchivo, 'utf-8');
        const datos = JSON.parse(contenido) as DatosGalaxiaJson;
        this.validarDatosGalaxia(datos);

        const id = datos.id || path.basename(nombreArchivo, '.json');
        const galaxia = new Galaxia(id, datos.nombre);

        for (const sistema of datos.sistemas) {
            galaxia.agregarSistema(new SistemaPlanetario(
                sistema.id,
                sistema.nombre,
                sistema.descripcion || 'Sistema planetario sin descripcion.',
                sistema.tipo
            ));
        }

        for (const ruta of datos.rutas) {
            galaxia.agregarRuta(ruta[0], ruta[1], 1);
        }

        return galaxia;
    }

    /*
         validarDatosGalaxia
        Entradas: Datos leidos desde JSON.
        Salidas: No retorna valor.
        Objetivo: Verificar que el archivo de galaxia tenga la estructura requerida.
    */
    private validarDatosGalaxia(datos: DatosGalaxiaJson): void {
        if (!datos.nombre || !Array.isArray(datos.sistemas) || !Array.isArray(datos.rutas)) {
            throw new Error('El archivo de galaxia tiene un formato invalido.');
        }

        if (!datos.modoPrueba && datos.sistemas.length < 25) {
            throw new Error('La galaxia debe tener al menos 25 sistemas planetarios.');
        }

        if (!datos.modoPrueba && datos.rutas.length < 40) {
            throw new Error('La galaxia debe tener al menos 40 rutas espaciales.');
        }

        if (datos.modoPrueba && datos.sistemas.length < 2) {
            throw new Error('La galaxia de prueba debe tener al menos 2 sistemas planetarios.');
        }

        if (datos.modoPrueba && datos.rutas.length < 1) {
            throw new Error('La galaxia de prueba debe tener al menos 1 ruta espacial.');
        }

        const ids = new Set<string>();

        for (const sistema of datos.sistemas) {
            if (!sistema.id || !sistema.nombre || !sistema.tipo) {
                throw new Error('Todos los sistemas deben tener id, nombre y tipo.');
            }

            if (ids.has(sistema.id)) {
                throw new Error(`El sistema ${sistema.id} esta repetido.`);
            }

            ids.add(sistema.id);
        }

        for (const ruta of datos.rutas) {
            if (ruta.length !== 2 || !ids.has(ruta[0]) || !ids.has(ruta[1])) {
                throw new Error('Todas las rutas deben conectar sistemas existentes.');
            }
        }
    }
}
