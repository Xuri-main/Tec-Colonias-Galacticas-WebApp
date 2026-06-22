/*
    Archivo: UnirsePartida.tsx
    Descripcion: Vista inicial para consultar y unirse a partidas disponibles.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

interface PropiedadesUnirsePartida {
  nickname: string;
  volverAlMenu: () => void;
}

/*
     UnirsePartida
    Entradas: Nickname del jugador y funcion para volver al menu.
    Salidas: Retorna una vista base para unirse a partidas.
    Objetivo: Preparar el espacio donde se listaran las partidas disponibles.
*/
export function UnirsePartida({ nickname, volverAlMenu }: PropiedadesUnirsePartida) {
  return (
    <section className="vista-simple animacion-entrada">
      <div className="panel-vista-simple">
        <span className="etiqueta-vista">Sala de reclutamiento</span>
        <h2>Unirse a partida</h2>
        <p>
          Comandante <strong>{nickname}</strong>, aqui se mostraran las partidas existentes con su
          identificador, galaxia, jugadores actuales, maximo de jugadores y estado.
        </p>
        <button className="boton-secundario" onClick={volverAlMenu}>Volver al menu</button>
      </div>
    </section>
  );
}
