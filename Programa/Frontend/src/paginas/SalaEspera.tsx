/*
    Archivo: SalaEspera.tsx
    Descripcion: Vista de espera donde los jugadores revisan la sala antes de iniciar la partida.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Clipboard, Copy, Crown, Hourglass, Play, RefreshCcw, Rocket, Shield, Users, Wifi, XCircle } from 'lucide-react';
import { iniciarPartida, obtenerPartidaPorId, unirsePartida } from '../servicios/servicioPartidas';
import { entrarSalaPartidaSocket, escucharCuentaRegresiva, escucharErrorJuego, escucharEstadoSocket, escucharPartidaActualizada, escucharPartidaIniciada, iniciarPartidaSocket, obtenerIdSocket, socketEstaConectado, unirsePartidaSocket } from '../servicios/servicioSocket';
import { GalaxiaResumen, JugadorResumen, PartidaDetalle } from '../tipos/tiposJuego';

interface PropiedadesSalaEspera {
  nickname: string;
  idPartida: string;
  idJugadorActual: string;
  volverAlMenu: () => void;
  guardarJugadorActual: (idJugador: string) => void;
  abrirJuego: () => void;
}

/*
     obtenerNombreGalaxia
    Entradas: Partida detallada o valor nulo.
    Salidas: Nombre de la galaxia como texto.
    Objetivo: Mostrar correctamente la galaxia aunque llegue como texto u objeto.
*/
function obtenerNombreGalaxia(partida: PartidaDetalle | null): string {
  if (!partida) {
    return 'Sin datos';
  }

  if (typeof partida.galaxia === 'string') {
    return partida.galaxia;
  }

  return (partida.galaxia as GalaxiaResumen | undefined)?.nombre || partida.nombreGalaxia || 'Galaxia no indicada';
}

/*
     buscarJugadorActual
    Entradas: Partida, nickname e id del jugador actual.
    Salidas: Jugador encontrado o valor indefinido.
    Objetivo: Saber si el usuario de la interfaz ya forma parte de la sala.
*/
function buscarJugadorActual(partida: PartidaDetalle | null, nickname: string, idJugadorActual: string): JugadorResumen | undefined {
  if (!partida || !partida.jugadores) {
    return undefined;
  }

  const jugadorPorId = partida.jugadores.find((jugador) => jugador.id === idJugadorActual);

  if (jugadorPorId) {
    return jugadorPorId;
  }

  return partida.jugadores.find((jugador) => jugador.nickname.trim().toLowerCase() === nickname.trim().toLowerCase());
}

/*
     calcularPorcentajeCupos
    Entradas: Partida detallada o valor nulo.
    Salidas: Porcentaje de ocupacion de la sala.
    Objetivo: Mostrar visualmente el avance de jugadores conectados.
*/
function calcularPorcentajeCupos(partida: PartidaDetalle | null): number {
  if (!partida || partida.maxJugadores <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((partida.jugadoresActuales / partida.maxJugadores) * 100));
}

/*
     SalaEspera
    Entradas: Nickname, id de partida, id de jugador y funciones de navegacion.
    Salidas: Interfaz de sala de espera.
    Objetivo: Consultar la partida, mostrar jugadores y permitir iniciar cuando la sala este completa.
*/
export function SalaEspera({ nickname, idPartida, idJugadorActual, volverAlMenu, guardarJugadorActual, abrirJuego }: PropiedadesSalaEspera) {
  const [partida, setPartida] = useState<PartidaDetalle | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [iniciando, setIniciando] = useState(false);
  const [registrando, setRegistrando] = useState(false);
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [socketConectado, setSocketConectado] = useState(false);
  const [cuentaRegresivaServidor, setCuentaRegresivaServidor] = useState<number | null>(null);

  /*
       cargarPartida
      Entradas: Indicador para saber si la carga es silenciosa.
      Salidas: No retorna valor.
      Objetivo: Consultar el estado actual de la sala en el backend.
  */
  const cargarPartida = async (silencioso = false) => {
    if (!idPartida) {
      setMensaje('No hay una partida seleccionada para mostrar en sala de espera.');
      return;
    }

    try {
      if (!silencioso) {
        setCargando(true);
      }

      const datos = await obtenerPartidaPorId(idPartida);
      setPartida(datos);

      if (!silencioso) {
        setMensaje('Sala actualizada correctamente.');
      }
    } catch (error: any) {
      setMensaje(error.message || 'No se pudo cargar la sala de espera.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const cancelarEstado = escucharEstadoSocket(setSocketConectado);

    const cancelarActualizacion = escucharPartidaActualizada((datos) => {
      if (datos.id !== idPartida) {
        return;
      }

      setPartida(datos);
      setRegistrando(false);
      setIniciando(false);
      setMensaje('Sala sincronizada en tiempo real por WebSocket.');

      const jugador = buscarJugadorActual(datos, nickname, idJugadorActual);
      if (jugador) {
        guardarJugadorActual(jugador.id);
      }
    });

    const cancelarInicio = escucharPartidaIniciada((datos) => {
      if (datos.id !== idPartida) {
        return;
      }

      setPartida(datos);
      setIniciando(false);
      setCuentaRegresivaServidor(null);
      setMensaje('Partida iniciada por el servidor. Ya puede entrar al campo galactico.');
    });

    const cancelarCuenta = escucharCuentaRegresiva((segundos) => {
      setCuentaRegresivaServidor(segundos);
      setMensaje(`Cuenta regresiva del servidor: ${segundos} segundos.`);
    });

    const cancelarError = escucharErrorJuego((texto) => {
      setMensaje(texto);
      setRegistrando(false);
      setIniciando(false);
      setCuentaRegresivaServidor(null);
    });

    entrarSalaPartidaSocket(idPartida);
    cargarPartida();

    return () => {
      cancelarEstado();
      cancelarActualizacion();
      cancelarInicio();
      cancelarCuenta();
      cancelarError();
    };
  }, [idPartida, nickname, idJugadorActual]);

  const jugadorActual = buscarJugadorActual(partida, nickname, idJugadorActual);
  const usuarioDentroSala = Boolean(jugadorActual);
  const cuposCompletos = Boolean(partida && partida.jugadoresActuales >= partida.maxJugadores);
  const puedeIniciar = Boolean(partida && partida.estado === 'esperando' && cuposCompletos);
  const porcentajeCupos = calcularPorcentajeCupos(partida);
  const partidaIniciada = partida?.estado === 'iniciada';

  /*
       copiarCodigo
      Entradas: No recibe entradas.
      Salidas: No retorna valor.
      Objetivo: Copiar el codigo de la partida al portapapeles.
  */
  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(idPartida);
      setCodigoCopiado(true);
      setTimeout(() => setCodigoCopiado(false), 1600);
    } catch {
      setMensaje('No se pudo copiar automaticamente. Puede seleccionar el codigo manualmente.');
    }
  };

  /*
       registrarseEnSala
      Entradas: No recibe entradas.
      Salidas: No retorna valor.
      Objetivo: Agregar al usuario actual como jugador si solo tenia el codigo de la sala.
  */
  const registrarseEnSala = async () => {
    if (!nickname.trim()) {
      setMensaje('Debe ingresar un nickname desde el menu principal.');
      return;
    }

    try {
      setRegistrando(true);
      setMensaje('Registrando comandante en la sala...');

      if (socketEstaConectado()) {
        unirsePartidaSocket(idPartida, nickname.trim());
        return;
      }

      const datos = await unirsePartida(idPartida, nickname.trim(), obtenerIdSocket());
      setPartida(datos);
      const jugador = buscarJugadorActual(datos, nickname, '');

      if (jugador) {
        guardarJugadorActual(jugador.id);
      }

      setMensaje('Comandante agregado a la sala correctamente.');
    } catch (error: any) {
      setMensaje(error.message || 'No fue posible registrar el jugador en esta sala.');
    } finally {
      setRegistrando(false);
    }
  };

  /*
       manejarInicio
      Entradas: No recibe entradas.
      Salidas: No retorna valor.
      Objetivo: Solicitar al backend iniciar la partida cuando la sala esta lista.
  */
  const manejarInicio = async () => {
    if (!puedeIniciar) {
      setMensaje('La partida solo puede iniciar cuando todos los cupos estan completos.');
      return;
    }

    try {
      setIniciando(true);
      setMensaje('Enviando orden de inicio al servidor por WebSocket...');

      if (socketEstaConectado()) {
        iniciarPartidaSocket(idPartida);
        return;
      }

      const datos = await iniciarPartida(idPartida);
      setPartida(datos);
      setMensaje('Partida iniciada. Ya puede entrar a la vista tactica del juego.');
    } catch (error: any) {
      setMensaje(error.message || 'No se pudo iniciar la partida.');
    } finally {
      setIniciando(false);
    }
  };

  return (
    <section className="vista-formulario vista-sala-espera animacion-entrada">
      <div className="cabecera-vista">
        <button className="boton-volver" onClick={volverAlMenu} type="button">
          <ArrowLeft size={16} />
          Volver al menu
        </button>
        <span className="etiqueta-vista">Sala de espera</span>
        <h2>Control de pre-lanzamiento</h2>
        <p>
          Comandante <strong>{nickname || 'sin identificar'}</strong>, esta pantalla concentra el codigo de acceso,
          los jugadores conectados y la orden para iniciar la partida cuando la sala este completa.
        </p>
      </div>

      <div className="rejilla-sala-espera">
        <div className="panel-principal-sala">
          <div className="encabezado-sala">
            <div>
              <Wifi size={17} />
              <span>{partida?.nombre || 'Cargando sala...'}</span>
              <em className={socketConectado ? 'estado-socket conectado' : 'estado-socket'}>{socketConectado ? 'WS conectado' : 'WS desconectado'}</em>
            </div>
            <button type="button" onClick={() => cargarPartida()} disabled={cargando}>
              <RefreshCcw size={14} />
              {cargando ? 'Actualizando' : 'Actualizar'}
            </button>
          </div>

          {mensaje && <div className={partidaIniciada ? 'mensaje-formulario exito' : 'mensaje-formulario'}>{mensaje}</div>}

          <div className="codigo-sala-espera">
            <div>
              <span>Codigo de acceso</span>
              <code>{idPartida || 'Sin codigo'}</code>
            </div>
            <button type="button" onClick={copiarCodigo} disabled={!idPartida}>
              <Copy size={15} />
              {codigoCopiado ? 'Copiado' : 'Copiar'}
            </button>
          </div>

          <div className="barra-progreso-sala">
            <div className="texto-progreso-sala">
              <span>Ocupacion de sala</span>
              <strong>{partida ? `${partida.jugadoresActuales}/${partida.maxJugadores}` : '0/0'}</strong>
            </div>
            <div className="base-progreso-sala">
              <div style={{ width: `${porcentajeCupos}%` }} />
            </div>
          </div>

          <div className="lista-jugadores-sala">
            <div className="titulo-lista-jugadores-sala">
              <Users size={16} />
              <span>Comandantes conectados</span>
              <div />
            </div>

            {(partida?.jugadores || []).map((jugador, indice) => (
              <article key={jugador.id} className={jugador.id === jugadorActual?.id ? 'jugador-sala actual' : 'jugador-sala'}>
                <div className="insignia-jugador-sala">
                  {indice === 0 ? <Crown size={15} /> : <Shield size={15} />}
                </div>
                <div>
                  <strong>{jugador.nickname}</strong>
                  <span>{jugador.id}</span>
                </div>
                {jugador.id === jugadorActual?.id && <em>Tu comandante</em>}
              </article>
            ))}

            {partida && partida.jugadoresActuales < partida.maxJugadores && (
              <div className="cupos-pendientes-sala">
                <Hourglass size={18} />
                <span>Esperando {partida.maxJugadores - partida.jugadoresActuales} jugador(es) mas para completar la sala.</span>
              </div>
            )}
          </div>
        </div>

        <aside className="panel-lateral-sala">
          <div className="tarjeta-resumen-creacion">
            <div className="titulo-resumen-creacion">
              <Rocket size={15} />
              <span>Estado de lanzamiento</span>
              <div />
            </div>
            <div className="linea-resumen">
              <span>Galaxia</span>
              <strong>{obtenerNombreGalaxia(partida)}</strong>
            </div>
            <div className="linea-resumen">
              <span>Estado</span>
              <strong>{partida?.estado || 'cargando'}</strong>
            </div>
            <div className="linea-resumen">
              <span>Cuenta servidor</span>
              <strong>{cuentaRegresivaServidor === null ? 'Sin cuenta' : `${cuentaRegresivaServidor}s`}</strong>
            </div>
            <div className="linea-resumen">
              <span>Duracion</span>
              <strong>{partida?.tiempoMaximoMinutos || 'Pendiente'} min</strong>
            </div>
            <div className="linea-resumen">
              <span>Tu registro</span>
              <strong>{usuarioDentroSala ? 'Activo' : 'Pendiente'}</strong>
            </div>
          </div>

          {!usuarioDentroSala && partida?.estado === 'esperando' && (
            <div className="tarjeta-accion-sala advertencia">
              <XCircle size={21} />
              <strong>No estas dentro de la sala</strong>
              <p>
                Tiene el codigo de la partida, pero su nickname todavia no aparece como jugador registrado.
              </p>
              <button type="button" onClick={registrarseEnSala} disabled={registrando}>
                <Users size={15} />
                {registrando ? 'Registrando...' : 'Registrarme en esta sala'}
              </button>
            </div>
          )}

          {usuarioDentroSala && !partidaIniciada && (
            <div className="tarjeta-accion-sala">
              <CheckCircle size={21} />
              <strong>Comandante confirmado</strong>
              <p>
                Su jugador ya fue aceptado por el backend. El inicio se habilita cuando se completen los cupos.
              </p>
            </div>
          )}

          <button className="boton-iniciar-sala" type="button" onClick={manejarInicio} disabled={!puedeIniciar || iniciando}>
            <Play size={17} />
            {partidaIniciada ? 'Partida iniciada' : iniciando ? 'Iniciando...' : 'Iniciar partida'}
          </button>

          {!puedeIniciar && !partidaIniciada && (
            <p className="nota-inicio-sala">
              La orden de inicio se mantiene bloqueada hasta que la sala llegue a su capacidad maxima.
            </p>
          )}

          {partidaIniciada && (
            <div className="tarjeta-accion-sala exito">
              <Rocket size={21} />
              <strong>La partida ya esta iniciada</strong>
              <p>
                Puede entrar a la vista tactica para revisar el mapa, sistemas, recursos, flotas e infraestructura.
              </p>
              <button type="button" onClick={abrirJuego}>
                <Rocket size={15} />
                Entrar al campo galactico
              </button>
            </div>
          )}

          <div className="tarjeta-resumen-creacion">
            <div className="titulo-resumen-creacion">
              <Clipboard size={15} />
              <span>Eventos recientes</span>
              <div />
            </div>
            <div className="eventos-sala">
              {(partida?.eventos || []).slice(-5).map((evento, indice) => (
                <span key={`${evento}-${indice}`}>{evento}</span>
              ))}
              {(!partida?.eventos || partida.eventos.length === 0) && <span>Sin eventos registrados todavia.</span>}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
