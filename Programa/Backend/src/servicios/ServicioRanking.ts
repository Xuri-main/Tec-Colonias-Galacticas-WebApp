/*
    Archivo: ServicioRanking.ts
    Descripcion: Contiene la logica para consultar y guardar el ranking historico.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { Partida } from '../modelos/Partida';
import { RepositorioRanking } from '../repositorios/RepositorioRanking';

export class ServicioRanking {
    private repositorioRanking: RepositorioRanking;

    /*
         constructor
        Entradas: Repositorio de ranking.
        Salidas: Nueva instancia de ServicioRanking.
        Objetivo: Inicializar el servicio de ranking historico.
    */
    constructor(repositorioRanking: RepositorioRanking) {
        this.repositorioRanking = repositorioRanking;
    }

    /*
         listarRanking
        Entradas: No recibe entradas.
        Salidas: Lista de registros historicos.
        Objetivo: Obtener el ranking guardado en archivo JSON.
    */
    public listarRanking(): object[] {
        return this.repositorioRanking.listar();
    }

    /*
         guardarResultadoPartida
        Entradas: Partida finalizada.
        Salidas: No retorna valor.
        Objetivo: Guardar al ganador de una partida en el ranking historico.
    */
    public guardarResultadoPartida(partida: Partida): void {
        const estadisticas = partida.calcularEstadisticas();
        const ganador = estadisticas[0] as any;

        if (!ganador) {
            return;
        }

        this.repositorioRanking.guardarRegistro({
            nombreGanador: ganador.nombre,
            sistemasControlados: ganador.sistemasConquistados,
            recursosAcumulados: ganador.recursosAcumulados,
            galaxia: partida.getGalaxia().getNombre(),
            identificadorPartida: partida.getId(),
            fechaRegistro: new Date()
        });
    }
}
