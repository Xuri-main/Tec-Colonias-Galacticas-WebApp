/*
    Archivo: App.tsx
    Descripcion: Componente principal que controla la navegacion inicial del frontend.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { useState } from 'react';
import { FondoGalactico } from './componentes/fondo/FondoGalactico';
import { BarraSuperior } from './componentes/interfaz/BarraSuperior';
import { BarraInferior } from './componentes/interfaz/BarraInferior';
import { MenuPrincipal } from './paginas/MenuPrincipal';
import { CrearPartida } from './paginas/CrearPartida';
import { UnirsePartida } from './paginas/UnirsePartida';
import { SalaEspera } from './paginas/SalaEspera';
import { Juego } from './paginas/Juego';
import { Ranking } from './paginas/Ranking';
import { VistaAplicacion } from './tipos/tiposJuego';

/*
     App
    Entradas: No recibe entradas.
    Salidas: Retorna la interfaz principal de la aplicacion.
    Objetivo: Mantener el nickname, la vista actual y la partida activa del jugador.
*/
export default function App() {
  const [nickname, setNickname] = useState('');
  const [vistaActual, setVistaActual] = useState<VistaAplicacion>('menu');
  const [idPartidaActiva, setIdPartidaActiva] = useState('');
  const [idJugadorActual, setIdJugadorActual] = useState('');

  /*
       volverAlMenu
      Entradas: No recibe entradas.
      Salidas: No retorna valor.
      Objetivo: Regresar al menu principal sin borrar el nickname del jugador.
  */
  const volverAlMenu = () => {
    setVistaActual('menu');
  };

  /*
       abrirSalaEspera
      Entradas: Id de partida y opcionalmente id de jugador.
      Salidas: No retorna valor.
      Objetivo: Guardar la partida activa y mostrar la sala de espera.
  */
  const abrirSalaEspera = (idPartida: string, idJugador?: string) => {
    setIdPartidaActiva(idPartida);

    if (idJugador) {
      setIdJugadorActual(idJugador);
    }

    setVistaActual('sala-espera');
  };

  /*
       abrirJuego
      Entradas: No recibe entradas.
      Salidas: No retorna valor.
      Objetivo: Cambiar a la vista principal del juego usando la partida activa.
  */
  const abrirJuego = () => {
    setVistaActual('juego');
  };

  return (
    <div className="aplicacion">
      <FondoGalactico />
      <div className="capa-contenido">
        <BarraSuperior />
        <main className="contenido-principal">
          {vistaActual === 'menu' && (
            <MenuPrincipal
              nickname={nickname}
              cambiarNickname={setNickname}
              cambiarVista={setVistaActual}
            />
          )}

          {vistaActual === 'crear-partida' && (
            <CrearPartida
              nickname={nickname}
              volverAlMenu={volverAlMenu}
              abrirSalaEspera={abrirSalaEspera}
            />
          )}

          {vistaActual === 'unirse-partida' && (
            <UnirsePartida
              nickname={nickname}
              volverAlMenu={volverAlMenu}
              abrirSalaEspera={abrirSalaEspera}
            />
          )}

          {vistaActual === 'sala-espera' && (
            <SalaEspera
              nickname={nickname}
              idPartida={idPartidaActiva}
              idJugadorActual={idJugadorActual}
              volverAlMenu={volverAlMenu}
              guardarJugadorActual={setIdJugadorActual}
              abrirJuego={abrirJuego}
            />
          )}

          {vistaActual === 'juego' && (
            <Juego
              nickname={nickname}
              idPartida={idPartidaActiva}
              idJugadorActual={idJugadorActual}
              volverSalaEspera={() => setVistaActual('sala-espera')}
              volverAlMenu={volverAlMenu}
            />
          )}

          {vistaActual === 'ranking' && (
            <Ranking volverAlMenu={volverAlMenu} />
          )}
        </main>
        <BarraInferior />
      </div>
    </div>
  );
}
