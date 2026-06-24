/*
    Archivo: Ranking.tsx
    Descripcion: Vista para mostrar el ranking historico de partidas finalizadas.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { useEffect, useState } from 'react';
import { Award, Boxes, Cpu, RefreshCcw, Rocket, Trophy, Zap } from 'lucide-react';
import { obtenerRanking } from '../servicios/servicioRanking';
import { escucharRankingActualizado } from '../servicios/servicioSocket';
import { RankingItem } from '../tipos/tiposJuego';

interface PropiedadesRanking {
  volverAlMenu: () => void;
}

/*
     obtenerIdPartida
    Entradas: Registro de ranking.
    Salidas: Identificador de partida.
    Objetivo: Soportar nombres de campo antiguos y nuevos del backend.
*/
function obtenerIdPartida(item: RankingItem): string {
  return item.idPartida || item.identificadorPartida || 'Sin ID';
}

/*
     Ranking
    Entradas: Funcion para volver al menu.
    Salidas: Retorna la vista de ranking.
    Objetivo: Consultar el backend y mostrar los ganadores historicos de partidas.
*/
export function Ranking({ volverAlMenu }: PropiedadesRanking) {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [mensaje, setMensaje] = useState('Cargando ranking...');
  const [cargando, setCargando] = useState(false);

  /*
       cargarRanking
      Entradas: No recibe entradas.
      Salidas: No retorna valor.
      Objetivo: Obtener el ranking historico desde el backend.
  */
  const cargarRanking = async () => {
    try {
      setCargando(true);
      const datos = await obtenerRanking();
      setRanking(datos);
      setMensaje(datos.length === 0 ? 'Todavia no hay partidas finalizadas.' : '');
    } catch {
      setMensaje('No se pudo cargar el ranking. Revise que el backend este activo.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarRanking();
    const cancelarRanking = escucharRankingActualizado(cargarRanking);
    return cancelarRanking;
  }, []);

  return (
    <section className="vista-ranking-completa animacion-entrada">
      <div className="cabecera-ranking-completa">
        <div>
          <span className="etiqueta-vista">Historial galactico</span>
          <h2>Ranking de comandantes</h2>
          <p>Ganadores historicos de partidas finalizadas, ordenados por puntaje final.</p>
        </div>
        <div className="acciones-ranking">
          <button type="button" onClick={cargarRanking} disabled={cargando}>
            <RefreshCcw size={15} />
            {cargando ? 'Cargando' : 'Actualizar'}
          </button>
          <button type="button" className="boton-secundario" onClick={volverAlMenu}>Volver al menu</button>
        </div>
      </div>

      {mensaje && <div className="mensaje-juego">{mensaje}</div>}

      <div className="ranking-destacado-grid">
        {ranking.slice(0, 3).map((item, indice) => (
          <div className="tarjeta-ranking-destacada" key={`${obtenerIdPartida(item)}-${indice}`}>
            <span>#{indice + 1}</span>
            <Trophy size={30} />
            <h3>{item.nombreGanador}</h3>
            <strong>{Number(item.puntaje || 0).toLocaleString()} puntos</strong>
            <p>{item.galaxia} / {item.sistemasControlados} sistemas</p>
          </div>
        ))}
      </div>

      <div className="panel-tabla-ranking">
        <div className="fila-ranking-completa encabezado-ranking">
          <span>Pos</span>
          <span>Ganador</span>
          <span>Puntaje</span>
          <span>Sistemas</span>
          <span>Recursos</span>
          <span>Galaxia</span>
          <span>Tiempo</span>
          <span>Partida</span>
        </div>

        {ranking.map((item, indice) => (
          <div className="fila-ranking-completa" key={`${obtenerIdPartida(item)}-${indice}`}>
            <span className="posicion-final">#{indice + 1}</span>
            <span className="nombre-final"><Award size={14} /> {item.nombreGanador}</span>
            <strong>{Number(item.puntaje || 0).toLocaleString()}</strong>
            <span>{item.sistemasControlados}</span>
            <span className="ranking-recursos">
              <Boxes size={13} /> {item.recursosAcumulados.minerales}
              <Zap size={13} /> {item.recursosAcumulados.energia}
              <Cpu size={13} /> {item.recursosAcumulados.cristales}
            </span>
            <span>{item.galaxia}</span>
            <span>{item.tiempoPartida || '0m 0s'}</span>
            <span>{obtenerIdPartida(item)}</span>
          </div>
        ))}

        {ranking.length === 0 && (
          <div className="estado-ranking-vacio">
            <Rocket size={32} />
            <strong>No hay resultados registrados</strong>
            <span>Finalice una partida para guardar el primer ganador historico.</span>
          </div>
        )}
      </div>
    </section>
  );
}
