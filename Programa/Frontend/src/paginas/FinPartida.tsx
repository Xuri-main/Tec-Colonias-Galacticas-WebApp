/*
    Archivo: FinPartida.tsx
    Descripcion: Muestra el resumen final, ganador y estadisticas de una partida terminada.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { Award, Boxes, Cpu, Crown, Flag, Radio, Rocket, Shield, Trophy, Zap } from 'lucide-react';
import { EstadisticaJugadorFinal, PartidaDetalle, Recursos } from '../tipos/tiposJuego';

interface PropiedadesFinPartida {
  partida: PartidaDetalle | null;
  volverAlMenu: () => void;
  abrirRanking: () => void;
}

/*
     obtenerTiempoTexto
    Entradas: Segundos jugados.
    Salidas: Tiempo en formato minutos y segundos.
    Objetivo: Mostrar la duracion de la partida de forma clara.
*/
function obtenerTiempoTexto(segundos?: number): string {
  const total = Number(segundos || 0);
  const minutos = Math.floor(total / 60);
  const restante = total % 60;
  return `${minutos}m ${restante}s`;
}

/*
     sumarRecursos
    Entradas: Recursos acumulados.
    Salidas: Suma ponderada visual simple.
    Objetivo: Mostrar un total compacto de recursos del jugador.
*/
function sumarRecursos(recursos: Recursos): number {
  return recursos.minerales + recursos.energia + recursos.cristales;
}

/*
     obtenerGanador
    Entradas: Partida finalizada.
    Salidas: Estadistica del ganador o valor indefinido.
    Objetivo: Buscar el primer lugar en los resultados finales.
*/
function obtenerGanador(partida: PartidaDetalle | null): EstadisticaJugadorFinal | undefined {
  return partida?.ganador || partida?.estadisticasFinales?.[0];
}

/*
     FinPartida
    Entradas: Partida finalizada y funciones de navegacion.
    Salidas: Retorna la pantalla de resultados finales.
    Objetivo: Presentar el cierre de la partida y dar acceso al ranking historico.
*/
export function FinPartida({ partida, volverAlMenu, abrirRanking }: PropiedadesFinPartida) {
  const ganador = obtenerGanador(partida);
  const estadisticas = partida?.estadisticasFinales || [];

  if (!partida) {
    return (
      <section className="vista-simple animacion-entrada">
        <div className="panel-vista-simple panel-fin-partida">
          <span className="etiqueta-vista">Sin resultados</span>
          <h2>Partida no disponible</h2>
          <p>No se recibieron datos finales de partida. Puede volver al menu y consultar el ranking.</p>
          <button className="boton-secundario" onClick={volverAlMenu}>Volver al menu</button>
        </div>
      </section>
    );
  }

  return (
    <section className="vista-fin-partida animacion-entrada">
      <div className="cabecera-fin-partida">
        <span className="etiqueta-vista">Resultado final</span>
        <h2>Partida finalizada</h2>
        <p>{partida.razonFinalizacion || 'La partida termino y se calcularon las posiciones finales.'}</p>
      </div>

      <div className="resumen-final-grid">
        <div className="panel-ganador-final">
          <div className="halo-ganador-final">
            <Crown size={44} />
          </div>
          <span>Ganador</span>
          <h3>{ganador?.nombre || 'Sin ganador'}</h3>
          <strong>{ganador?.puntaje?.toLocaleString() || 0} puntos</strong>
          <p>{ganador?.sistemasConquistados || 0} sistemas controlados al finalizar la partida.</p>
        </div>

        <div className="panel-datos-finales">
          <div className="dato-final">
            <Flag size={18} />
            <span>Partida</span>
            <strong>{partida.id}</strong>
          </div>
          <div className="dato-final">
            <Radio size={18} />
            <span>Galaxia</span>
            <strong>{typeof partida.galaxia === 'string' ? partida.galaxia : partida.galaxia?.nombre}</strong>
          </div>
          <div className="dato-final">
            <Rocket size={18} />
            <span>Duracion</span>
            <strong>{obtenerTiempoTexto(partida.tiempoJugadoSegundos)}</strong>
          </div>
          <div className="dato-final">
            <Shield size={18} />
            <span>Jugadores</span>
            <strong>{partida.jugadoresActuales}</strong>
          </div>
        </div>
      </div>

      <div className="panel-tabla-final">
        <div className="titulo-panel-juego">
          <Trophy size={15} />
          <span>Estadisticas por comandante</span>
          <div />
        </div>

        <div className="tabla-final-jugadores">
          <div className="fila-final encabezado-final">
            <span>Pos</span>
            <span>Comandante</span>
            <span>Puntaje</span>
            <span>Sistemas</span>
            <span>Recursos</span>
            <span>Flotas</span>
            <span>Minas</span>
            <span>Centros</span>
            <span>Fortalezas</span>
          </div>

          {estadisticas.map((jugador) => (
            <div className="fila-final" key={jugador.jugadorId}>
              <span className="posicion-final">#{jugador.posicion}</span>
              <span className="nombre-final"><Award size={14} /> {jugador.nombre}</span>
              <strong>{jugador.puntaje.toLocaleString()}</strong>
              <span>{jugador.sistemasConquistados}</span>
              <span className="recursos-final-mini">
                <Boxes size={13} /> {sumarRecursos(jugador.recursosAcumulados)}
              </span>
              <span><Rocket size={13} /> {jugador.flotasEnPie}</span>
              <span>{jugador.minasEnPie}</span>
              <span>{jugador.centrosEnPie}</span>
              <span>{jugador.fortalezasEnPie}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-desglose-ganador">
        <div>
          <Boxes size={18} />
          <span>Minerales</span>
          <strong>{ganador?.recursosAcumulados.minerales || 0}</strong>
        </div>
        <div>
          <Zap size={18} />
          <span>Energia</span>
          <strong>{ganador?.recursosAcumulados.energia || 0}</strong>
        </div>
        <div>
          <Cpu size={18} />
          <span>Cristales</span>
          <strong>{ganador?.recursosAcumulados.cristales || 0}</strong>
        </div>
        <div>
          <Trophy size={18} />
          <span>Ranking</span>
          <strong>Guardado</strong>
        </div>
      </div>

      <div className="acciones-final-partida">
        <button type="button" className="boton-secundario" onClick={volverAlMenu}>Volver al menu</button>
        <button type="button" className="boton-principal" onClick={abrirRanking}>Ver ranking historico</button>
      </div>
    </section>
  );
}
