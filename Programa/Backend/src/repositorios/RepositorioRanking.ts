/*
    Archivo: RepositorioRanking.ts
    Descripcion: Administra la lectura y escritura del ranking historico en un archivo JSON.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import fs from 'fs';
import path from 'path';

export class RepositorioRanking {
    private rutaRanking: string;

    /*
         constructor
        Entradas: No recibe entradas.
        Salidas: Nueva instancia de RepositorioRanking.
        Objetivo: Definir el archivo donde se guarda el ranking historico.
    */
    constructor() {
        this.rutaRanking = path.join(process.cwd(), 'src', 'datos', 'ranking.json');
    }

    /*
         listar
        Entradas: No recibe entradas.
        Salidas: Lista de registros del ranking.
        Objetivo: Leer el ranking historico desde el archivo JSON.
    */
    public listar(): object[] {
        if (!fs.existsSync(this.rutaRanking)) {
            return [];
        }

        const contenido = fs.readFileSync(this.rutaRanking, 'utf-8');
        return JSON.parse(contenido) as object[];
    }

    /*
         guardarRegistro
        Entradas: Registro de ranking.
        Salidas: No retorna valor.
        Objetivo: Agregar un resultado final al ranking historico.
    */
    public guardarRegistro(registro: object): void {
        const ranking = this.listar();
        ranking.push(registro);
        fs.writeFileSync(this.rutaRanking, JSON.stringify(ranking, null, 2), 'utf-8');
    }
}
