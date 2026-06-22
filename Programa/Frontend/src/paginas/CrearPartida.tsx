/*
    Archivo: CrearPartida.tsx
    Descripcion: Vista inicial para crear una partida nueva.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

interface PropiedadesCrearPartida {
  nickname: string;
  volverAlMenu: () => void;
}

/*
     CrearPartida
    Entradas: Nickname del jugador y funcion para volver al menu.
    Salidas: Retorna una vista base para crear partidas.
    Objetivo: Preparar el espacio donde se implementara el formulario de creacion.
*/
export function CrearPartida({ nickname, volverAlMenu }: PropiedadesCrearPartida) {
  return (
    <section className="vista-simple animacion-entrada">
      <div className="panel-vista-simple">
        <span className="etiqueta-vista">Modulo de partida</span>
        <h2>Crear partida</h2>
        <p>
          Comandante <strong>{nickname}</strong>, este sera el formulario para elegir galaxia,
          cantidad maxima de jugadores, tiempo maximo y recursos iniciales.
        </p>
        <button className="boton-secundario" onClick={volverAlMenu}>Volver al menu</button>
      </div>
    </section>
  );
}
