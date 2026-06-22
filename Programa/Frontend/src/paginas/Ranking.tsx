/*
    Archivo: Ranking.tsx
    Descripcion: Vista inicial para mostrar el ranking historico.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { useEffect, useState } from 'react';
import { obtenerRanking } from '../servicios/servicioRanking';
import { RankingItem } from '../tipos/tiposJuego';

interface PropiedadesRanking {
  volverAlMenu: () => void;
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

  useEffect(() => {
    const cargarRanking = async () => {
      try {
        const datos = await obtenerRanking();
        setRanking(datos);
        setMensaje(datos.length === 0 ? 'Todavia no hay partidas finalizadas.' : '');
      } catch {
        setMensaje('No se pudo cargar el ranking. Revise que el backend este activo.');
      }
    };

    cargarRanking();
  }, []);

  return (
    <section className="vista-simple animacion-entrada">
      <div className="panel-vista-simple panel-ranking">
        <span className="etiqueta-vista">Historial galactico</span>
        <h2>Ranking</h2>
        {mensaje && <p>{mensaje}</p>}
        {ranking.map((item, indice) => (
          <div className="registro-ranking" key={`${item.idPartida}-${indice}`}>
            <strong>#{indice + 1} {item.nombreGanador}</strong>
            <span>{item.galaxia} / {item.sistemasControlados} sistemas controlados</span>
          </div>
        ))}
        <button className="boton-secundario" onClick={volverAlMenu}>Volver al menu</button>
      </div>
    </section>
  );
}
