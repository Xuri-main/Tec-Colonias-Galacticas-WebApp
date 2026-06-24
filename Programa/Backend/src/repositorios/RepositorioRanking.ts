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

        if (!contenido.trim()) {
            return [];
        }

        const ranking = JSON.parse(contenido) as any[];

        ranking.sort((a: any, b: any) => {
            const puntajeA = Number(a.puntaje || 0);
            const puntajeB = Number(b.puntaje || 0);

            if (puntajeB !== puntajeA) {
                return puntajeB - puntajeA;
            }

            return new Date(b.fechaRegistro || 0).getTime() - new Date(a.fechaRegistro || 0).getTime();
        });

        return ranking;
    }

    /*
         guardarRegistro
        Entradas: Registro de ranking.
        Salidas: No retorna valor.
        Objetivo: Agregar un resultado final al ranking historico evitando duplicados por partida.
    */
    public guardarRegistro(registro: object): void {
        const ranking = this.listar() as any[];
        const idPartida = (registro as any).idPartida || (registro as any).identificadorPartida;
        const existe = ranking.some((actual: any) => actual.idPartida === idPartida || actual.identificadorPartida === idPartida);

        if (existe) {
            return;
        }

        ranking.push(registro);
        fs.writeFileSync(this.rutaRanking, JSON.stringify(ranking, null, 2), 'utf-8');
    }
}
