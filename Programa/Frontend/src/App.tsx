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
import { Ranking } from './paginas/Ranking';
import { VistaAplicacion } from './tipos/tiposJuego';

/*
     App
    Entradas: No recibe entradas.
    Salidas: Retorna la interfaz principal de la aplicacion.
    Objetivo: Mantener el nickname del jugador y decidir que vista se muestra.
*/
export default function App() {
  const [nickname, setNickname] = useState('');
  const [vistaActual, setVistaActual] = useState<VistaAplicacion>('menu');

  const volverAlMenu = () => setVistaActual('menu');

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
            <CrearPartida nickname={nickname} volverAlMenu={volverAlMenu} />
          )}

          {vistaActual === 'unirse-partida' && (
            <UnirsePartida nickname={nickname} volverAlMenu={volverAlMenu} />
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
