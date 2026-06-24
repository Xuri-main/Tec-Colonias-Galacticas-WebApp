/*
    Archivo: UnirsePartida.tsx
    Descripcion: Vista para consultar partidas disponibles y unirse a una sala existente.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Clipboard, Copy, Globe, RefreshCcw, Search, Users, Wifi, Zap } from 'lucide-react';
import { obtenerPartidas, unirsePartida } from '../servicios/servicioPartidas';
import { escucharErrorJuego, escucharEstadoSocket, escucharPartidasActualizadas, obtenerIdSocket, pedirPartidasActualizadas } from '../servicios/servicioSocket';
import { GalaxiaResumen, PartidaDetalle, PartidaResumen } from '../tipos/tiposJuego';

interface PropiedadesUnirsePartida {
  nickname: string;
  volverAlMenu: () => void;
  abrirSalaEspera: (idPartida: string, idJugador?: string) => void;
}

/*
     obtenerNombreGalaxia
    Entradas: Partida resumida o detallada.
    Salidas: Nombre de galaxia como texto.
    Objetivo: Mostrar la galaxia aunque el backend envie string u objeto.
*/
function obtenerNombreGalaxia(partida: PartidaResumen | PartidaDetalle): string {
  if (typeof partida.galaxia === 'string') {
    return partida.galaxia;
  }

  return (partida.galaxia as GalaxiaResumen | undefined)?.nombre || partida.nombreGalaxia || 'Galaxia no indicada';
}

/*
     puedeUnirse
    Entradas: Partida resumida.
    Salidas: Verdadero si la partida acepta jugadores.
    Objetivo: Bloquear visualmente partidas llenas, cerradas, iniciadas o finalizadas.
*/
function puedeUnirse(partida: PartidaResumen): boolean {
  return partida.estado === 'esperando' && partida.jugadoresActuales < partida.maxJugadores;
}

/*
     UnirsePartida
    Entradas: Nickname del jugador y funcion para volver al menu.
    Salidas: Retorna lista de partidas y formulario de ingreso por codigo.
    Objetivo: Permitir incorporarse a partidas existentes usando el backend.
*/
export function UnirsePartida({ nickname, volverAlMenu, abrirSalaEspera }: PropiedadesUnirsePartida) {
  const [partidas, setPartidas] = useState<PartidaResumen[]>([]);
  const [idManual, setIdManual] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [uniendoId, setUniendoId] = useState('');
  const [partidaUnida, setPartidaUnida] = useState<PartidaDetalle | null>(null);
  const [idCopiado, setIdCopiado] = useState(false);
  const [socketConectado, setSocketConectado] = useState(false);

  /*
       cargarPartidas
      Entradas: No recibe entradas.
      Salidas: No retorna valor.
      Objetivo: Solicitar al backend la lista de partidas actuales.
  */
  const cargarPartidas = async () => {
    try {
      setCargando(true);
      const datos = await obtenerPartidas();
      setPartidas(datos);
      setMensaje(datos.length === 0 ? 'No hay partidas disponibles por el momento.' : '');
    } catch {
      setMensaje('No se pudieron cargar las partidas. Revise que el backend este activo.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const cancelarEstado = escucharEstadoSocket(setSocketConectado);

    const cancelarPartidas = escucharPartidasActualizadas((datos) => {
      setPartidas(datos);
      setCargando(false);
      setMensaje(datos.length === 0 ? 'No hay partidas disponibles por el momento.' : 'Lista sincronizada en tiempo real.');
    });

    const cancelarError = escucharErrorJuego((texto) => {
      setMensaje(texto);
      setUniendoId('');
    });

    pedirPartidasActualizadas();
    cargarPartidas();

    return () => {
      cancelarEstado();
      cancelarPartidas();
      cancelarError();
    };
  }, []);

  /*
       validarIngreso
      Entradas: Identificador de partida.
      Salidas: Mensaje de error o texto vacio.
      Objetivo: Evitar intentos de ingreso sin nickname o sin codigo valido.
  */
  const validarIngreso = (idPartida: string): string => {
    if (partidaUnida) {
      return 'Ya se unio a una partida desde esta pantalla.';
    }

    if (!nickname.trim()) {
      return 'Debe ingresar un nickname desde el menu principal.';
    }

    if (nickname.trim().length < 3) {
      return 'El nickname debe tener al menos 3 caracteres.';
    }

    if (!idPartida.trim()) {
      return 'Debe indicar el identificador de la partida.';
    }

    return '';
  };

  /*
       manejarUnion
      Entradas: Identificador de la partida seleccionada.
      Salidas: No retorna valor.
      Objetivo: Unir al jugador actual a la partida seleccionada.
  */
  const manejarUnion = async (idPartida: string) => {
    const error = validarIngreso(idPartida);

    if (error) {
      setMensaje(error);
      return;
    }

    try {
      setUniendoId(idPartida);
      setMensaje('Solicitando ingreso a la sala...');
      const partida = await unirsePartida(idPartida.trim(), nickname.trim(), obtenerIdSocket());
      setPartidaUnida(partida);
      setMensaje('Ingreso completado. Espere a que se complete la sala para iniciar.');
    } catch (error: any) {
      setMensaje(error.message || 'No se pudo unir a la partida.');
    } finally {
      setUniendoId('');
    }
  };

  /*
       manejarIngresoManual
      Entradas: Evento del formulario.
      Salidas: No retorna valor.
      Objetivo: Unirse a una partida escribiendo manualmente el codigo.
  */
  const manejarIngresoManual = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    manejarUnion(idManual);
  };

  /*
       copiarIdPartida
      Entradas: No recibe entradas.
      Salidas: No retorna valor.
      Objetivo: Copiar el identificador de la partida unida.
  */
  const copiarIdPartida = async () => {
    if (!partidaUnida) return;

    try {
      await navigator.clipboard.writeText(partidaUnida.id);
      setIdCopiado(true);
      setTimeout(() => setIdCopiado(false), 1600);
    } catch {
      setMensaje('No se pudo copiar el identificador automaticamente.');
    }
  };

  const jugadorUnido = partidaUnida?.jugadores?.find(
    (jugador) => jugador.nickname.trim().toLowerCase() === nickname.trim().toLowerCase()
  );

  if (partidaUnida) {
    return (
      <section className="vista-formulario animacion-entrada">
        <div className="cabecera-vista">
          <button className="boton-volver" onClick={volverAlMenu} type="button">
            <ArrowLeft size={16} />
            Volver al menu
          </button>
          <span className="etiqueta-vista">Ingreso confirmado</span>
          <h2>Sala encontrada</h2>
          <p>
            Comandante <strong>{nickname}</strong>, ya forma parte de la partida. La sala de espera completa
            se implementara en el siguiente bloque para iniciar la partida con todos los jugadores.
          </p>
        </div>

        <div className="rejilla-confirmacion-creacion">
          <div className="panel-confirmacion-partida">
            <div className="icono-confirmacion magenta">
              <CheckCircle size={34} />
            </div>
            <span className="etiqueta-vista">Jugador incorporado</span>
            <h3>{partidaUnida.nombre}</h3>
            <div className="codigo-grande-partida">
              <code>{partidaUnida.id}</code>
              <button type="button" onClick={copiarIdPartida}>
                <Copy size={15} />
                {idCopiado ? 'Copiado' : 'Copiar codigo'}
              </button>
            </div>
            <p>
              El backend valido el nickname, el cupo de la partida y el estado de espera antes de permitir el ingreso.
            </p>
            <button
              className="boton-principal boton-entrada-sala"
              type="button"
              onClick={() => abrirSalaEspera(partidaUnida.id, jugadorUnido?.id)}
            >
              <Users size={16} />
              Entrar a sala de espera
            </button>
          </div>

          <aside className="panel-resumen-creacion">
            <div className="tarjeta-resumen-creacion">
              <div className="titulo-resumen-creacion">
                <Globe size={15} />
                <span>Resumen de sala</span>
                <div />
              </div>
              <div className="linea-resumen">
                <span>Galaxia</span>
                <strong>{obtenerNombreGalaxia(partidaUnida)}</strong>
              </div>
              <div className="linea-resumen">
                <span>Jugadores</span>
                <strong>{partidaUnida.jugadoresActuales}/{partidaUnida.maxJugadores}</strong>
              </div>
              <div className="linea-resumen">
                <span>Estado</span>
                <strong>{partidaUnida.estado}</strong>
              </div>
              <div className="linea-resumen">
                <span>Duracion</span>
                <strong>{partidaUnida.tiempoMaximoMinutos || 'Pendiente'} min</strong>
              </div>
            </div>

            <div className="tarjeta-resumen-creacion">
              <div className="titulo-resumen-creacion">
                <Users size={15} />
                <span>Jugadores conectados</span>
                <div />
              </div>
              <div className="lista-jugadores-unidos">
                {(partidaUnida.jugadores || []).map((jugador) => (
                  <div key={jugador.id}>
                    <span>{jugador.nickname}</span>
                    <strong>{jugador.id}</strong>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    );
  }

  return (
    <section className="vista-formulario animacion-entrada">
      <div className="cabecera-vista">
        <button className="boton-volver" onClick={volverAlMenu} type="button">
          <ArrowLeft size={16} />
          Volver al menu
        </button>
        <span className="etiqueta-vista">Sala de reclutamiento</span>
        <h2>Unirse a partida</h2>
        <p>
          Comandante <strong>{nickname || 'sin identificar'}</strong>, seleccione una sala disponible o escriba
          el codigo que le compartio el creador de la partida.
        </p>
      </div>

      <div className="rejilla-unirse-partida">
        <div className="panel-lista-partidas">
          <div className="encabezado-lista-partidas">
            <div>
              <Wifi size={16} />
              <span>Partidas activas</span>
              <em className={socketConectado ? 'estado-socket conectado' : 'estado-socket'}>{socketConectado ? 'WS conectado' : 'WS desconectado'}</em>
            </div>
            <button type="button" onClick={cargarPartidas} disabled={cargando}>
              <RefreshCcw size={14} />
              {cargando ? 'Actualizando' : 'Actualizar'}
            </button>
          </div>

          {mensaje && <div className="mensaje-formulario">{mensaje}</div>}

          <div className="lista-partidas">
            {partidas.map((partida) => {
              const disponible = puedeUnirse(partida);

              return (
                <article key={partida.id} className={disponible ? 'tarjeta-partida-disponible' : 'tarjeta-partida-disponible bloqueada'}>
                  <div className="superior-tarjeta-partida">
                    <div>
                      <span className="codigo-pequeno-partida">{partida.id}</span>
                      <h3>{partida.nombre}</h3>
                    </div>
                    <span className={disponible ? 'estado-partida disponible' : 'estado-partida'}>{partida.estado}</span>
                  </div>

                  <div className="datos-tarjeta-partida">
                    <div>
                      <span>Galaxia</span>
                      <strong>{obtenerNombreGalaxia(partida)}</strong>
                    </div>
                    <div>
                      <span>Jugadores</span>
                      <strong>{partida.jugadoresActuales}/{partida.maxJugadores}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!disponible || uniendoId === partida.id}
                    onClick={() => manejarUnion(partida.id)}
                  >
                    <Zap size={14} />
                    {uniendoId === partida.id ? 'Uniendo...' : disponible ? 'Unirse' : 'No disponible'}
                  </button>
                </article>
              );
            })}

            {partidas.length === 0 && !cargando && (
              <div className="estado-vacio-partidas">
                <Search size={28} />
                <strong>Sin salas detectadas</strong>
                <span>Cree una partida nueva o actualice la lista cuando el backend tenga salas en espera.</span>
              </div>
            )}
          </div>
        </div>

        <aside className="panel-ingreso-manual">
          <div className="tarjeta-resumen-creacion">
            <div className="titulo-resumen-creacion">
              <Clipboard size={15} />
              <span>Ingreso por codigo</span>
              <div />
            </div>
            <form onSubmit={manejarIngresoManual}>
              <div className="grupo-campo">
                <label>Identificador de partida</label>
                <input
                  type="text"
                  value={idManual}
                  onChange={(evento) => setIdManual(evento.target.value)}
                  placeholder="Ejemplo: P1782141963347"
                  maxLength={32}
                />
              </div>
              <button className="boton-principal" type="submit" disabled={uniendoId === idManual.trim()}>
                <Users size={16} />
                Unirse por codigo
              </button>
            </form>
          </div>

          <div className="aviso-creacion">
            <Users size={15} />
            <p>
              Esta pantalla escucha el evento de partidas actualizadas por WebSocket. El boton de actualizar queda como respaldo manual.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
