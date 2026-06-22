/*
    Archivo: FilaRanking.tsx
    Descripcion: Fila visual para mostrar un comandante dentro del ranking.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

interface PropiedadesFilaRanking {
  posicion: number;
  nombre: string;
  puntaje: string;
}

/*
     FilaRanking
    Entradas: Posicion, nombre y puntaje.
    Salidas: Retorna una fila de ranking.
    Objetivo: Reutilizar el estilo de las posiciones del ranking.
*/
export function FilaRanking({ posicion, nombre, puntaje }: PropiedadesFilaRanking) {
  return (
    <div className="fila-ranking">
      <span className={`ranking-posicion posicion-${posicion}`}>{posicion}</span>
      <span className="ranking-nombre">{nombre}</span>
      <span className="ranking-puntaje">{puntaje}</span>
    </div>
  );
}
