/*
    Archivo: Juego.tsx
    Descripcion: Vista principal del juego con mapa galactico, paneles de informacion y controles tacticos iniciales.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Boxes, Cpu, Crosshair, Hammer, Orbit, Radio, RefreshCcw, Rocket, Shield, Swords, Timer, Zap } from 'lucide-react';
import { obtenerPartidaPorId } from '../servicios/servicioPartidas';
import { GalaxiaResumen, JugadorResumen, PartidaDetalle, Recursos, RutaResumen, SistemaResumen } from '../tipos/tiposJuego';

interface PropiedadesJuego {
  nickname: string;
  idPartida: string;
  idJugadorActual: string;
  volverSalaEspera: () => void;
  volverAlMenu: () => void;
}

interface PosicionSistema {
  x: number;
  y: number;
}

const posicionesSistemas: Record<string, PosicionSistema> = {
  S1: { x: 50, y: 9 },
  S2: { x: 63, y: 12 },
  S3: { x: 74, y: 19 },
  S4: { x: 84, y: 30 },
  S5: { x: 89, y: 44 },
  S6: { x: 87, y: 59 },
  S7: { x: 79, y: 72 },
  S8: { x: 67, y: 82 },
  S9: { x: 52, y: 88 },
  S10: { x: 38, y: 85 },
  S11: { x: 25, y: 77 },
  S12: { x: 14, y: 64 },
  S13: { x: 10, y: 49 },
  S14: { x: 13, y: 34 },
  S15: { x: 22, y: 22 },
  S16: { x: 35, y: 14 },
  S17: { x: 50, y: 28 },
  S18: { x: 64, y: 33 },
  S19: { x: 72, y: 48 },
  S20: { x: 64, y: 63 },
  S21: { x: 49, y: 69 },
  S22: { x: 34, y: 64 },
  S23: { x: 26, y: 49 },
  S24: { x: 35, y: 34 },
  S25: { x: 50, y: 47 }
};

const produccionPorTipo: Record<string, Recursos> = {
  minero: { minerales: 100, energia: 30, cristales: 10 },
  energetico: { minerales: 50, energia: 50, cristales: 10 },
  cientifico: { minerales: 40, energia: 40, cristales: 30 },
  balanceado: { minerales: 35, energia: 35, cristales: 35 }
};

/*
     obtenerNombreGalaxia
    Entradas: Partida detallada o valor nulo.
    Salidas: Nombre de la galaxia.
    Objetivo: Mostrar el nombre de la galaxia aunque el backend envie texto u objeto.
*/
function obtenerNombreGalaxia(partida: PartidaDetalle | null): string {
  if (!partida) {
    return 'Galaxia no cargada';
  }

  if (typeof partida.galaxia === 'string') {
    return partida.galaxia;
  }

  return (partida.galaxia as GalaxiaResumen | undefined)?.nombre || partida.nombreGalaxia || 'Galaxia no indicada';
}

/*
     obtenerSistemas
    Entradas: Partida detallada o valor nulo.
    Salidas: Lista de sistemas planetarios.
    Objetivo: Extraer los sistemas de la galaxia activa de forma segura.
*/
function obtenerSistemas(partida: PartidaDetalle | null): SistemaResumen[] {
  if (!partida || typeof partida.galaxia === 'string') {
    return [];
  }

  return (partida.galaxia as GalaxiaResumen).sistemas || [];
}

/*
     obtenerRutas
    Entradas: Partida detallada o valor nulo.
    Salidas: Lista de rutas espaciales.
    Objetivo: Extraer las rutas de la galaxia activa de forma segura.
*/
function obtenerRutas(partida: PartidaDetalle | null): RutaResumen[] {
  if (!partida || typeof partida.galaxia === 'string') {
    return [];
  }

  return (partida.galaxia as GalaxiaResumen).rutas || [];
}

/*
     obtenerExtremosRuta
    Entradas: Ruta espacial resumida.
    Salidas: Identificadores de origen y destino.
    Objetivo: Soportar diferentes nombres de campos que podria enviar el backend.
*/
function obtenerExtremosRuta(ruta: RutaResumen): { origen: string; destino: string } {
  return {
    origen: ruta.origenId || ruta.origen || '',
    destino: ruta.destinoId || ruta.destino || ''
  };
}

/*
     obtenerJugadorActual
    Entradas: Partida, nickname e id del jugador.
    Salidas: Jugador encontrado o valor indefinido.
    Objetivo: Identificar al comandante que esta usando la interfaz.
*/
function obtenerJugadorActual(partida: PartidaDetalle | null, nickname: string, idJugadorActual: string): JugadorResumen | undefined {
  if (!partida || !partida.jugadores) {
    return undefined;
  }

  const porId = partida.jugadores.find((jugador) => jugador.id === idJugadorActual);

  if (porId) {
    return porId;
  }

  return partida.jugadores.find((jugador) => jugador.nickname.toLowerCase() === nickname.trim().toLowerCase());
}

/*
     obtenerNombrePropietario
    Entradas: Sistema y lista de jugadores.
    Salidas: Nombre visible del propietario.
    Objetivo: Traducir el id del propietario a un nickname entendible para el usuario.
*/
function obtenerNombrePropietario(sistema: SistemaResumen | null, jugadores: JugadorResumen[]): string {
  if (!sistema || !sistema.propietarioId) {
    return 'Sistema neutral';
  }

  const jugador = jugadores.find((actual) => actual.id === sistema.propietarioId);
  return jugador?.nickname || sistema.propietarioId;
}

/*
     obtenerClaseSistema
    Entradas: Sistema y jugador actual.
    Salidas: Clase CSS del nodo.
    Objetivo: Diferenciar visualmente sistemas propios, enemigos y neutrales.
*/
function obtenerClaseSistema(sistema: SistemaResumen, jugadorActual?: JugadorResumen): string {
  if (!sistema.propietarioId) {
    return 'neutral';
  }

  if (jugadorActual && sistema.propietarioId === jugadorActual.id) {
    return 'propio';
  }

  return 'enemigo';
}

/*
     obtenerProduccion
    Entradas: Tipo de sistema.
    Salidas: Produccion configurada por ciclo.
    Objetivo: Mostrar al jugador que produce cada planeta segun su tipo.
*/
function obtenerProduccion(tipo?: string): Recursos {
  return produccionPorTipo[tipo || ''] || { minerales: 0, energia: 0, cristales: 0 };
}

/*
     contarSistemasJugador
    Entradas: Sistemas y jugador actual.
    Salidas: Cantidad de sistemas controlados.
    Objetivo: Mostrar avance territorial del jugador en la interfaz.
*/
function contarSistemasJugador(sistemas: SistemaResumen[], jugadorActual?: JugadorResumen): number {
  if (!jugadorActual) {
    return 0;
  }

  return sistemas.filter((sistema) => sistema.propietarioId === jugadorActual.id).length;
}

/*
     Juego
    Entradas: Nickname, id de partida, id de jugador y funciones de navegacion.
    Salidas: Retorna la interfaz principal del juego.
    Objetivo: Mostrar el mapa galactico y los paneles necesarios para controlar la partida.
*/
export function Juego({ nickname, idPartida, idJugadorActual, volverSalaEspera, volverAlMenu }: PropiedadesJuego) {
  const [partida, setPartida] = useState<PartidaDetalle | null>(null);
  const [idSistemaSeleccionado, setIdSistemaSeleccionado] = useState('');
  const [mensaje, setMensaje] = useState('Cargando campo galactico...');
  const [cargando, setCargando] = useState(false);
  const [teclaUDetectada, setTeclaUDetectada] = useState(false);

  const sistemas = useMemo(() => obtenerSistemas(partida), [partida]);
  const rutas = useMemo(() => obtenerRutas(partida), [partida]);
  const jugadorActual = obtenerJugadorActual(partida, nickname, idJugadorActual);
  const sistemaSeleccionado = sistemas.find((sistema) => sistema.id === idSistemaSeleccionado) || sistemas[0] || null;
  const produccionSeleccionada = obtenerProduccion(sistemaSeleccionado?.tipo);
  const sistemasControlados = contarSistemasJugador(sistemas, jugadorActual);
  const jugadores = partida?.jugadores || [];

  /*
       cargarPartida
      Entradas: Indicador para saber si la carga es silenciosa.
      Salidas: No retorna valor.
      Objetivo: Consultar el estado de la partida para refrescar el mapa y los paneles.
  */
  const cargarPartida = async (silencioso = false) => {
    if (!idPartida) {
      setMensaje('No hay una partida activa para mostrar. Regrese al menu e ingrese a una sala.');
      return;
    }

    try {
      if (!silencioso) {
        setCargando(true);
      }

      const datos = await obtenerPartidaPorId(idPartida);
      setPartida(datos);
      setMensaje('Estado galactico sincronizado con el servidor.');

      const listaSistemas = obtenerSistemas(datos);
      if (!idSistemaSeleccionado && listaSistemas.length > 0) {
        const baseJugador = obtenerJugadorActual(datos, nickname, idJugadorActual)?.planetaBaseId;
        setIdSistemaSeleccionado(baseJugador || listaSistemas[0].id);
      }
    } catch (error: any) {
      setMensaje(error.message || 'No se pudo cargar la vista de juego.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPartida();
    const intervalo = window.setInterval(() => cargarPartida(true), 5000);
    return () => window.clearInterval(intervalo);
  }, [idPartida]);

  useEffect(() => {
    const manejarTecla = (evento: KeyboardEvent) => {
      if (evento.key.toLowerCase() === 'u') {
        setTeclaUDetectada(true);
      }
    };

    window.addEventListener('keydown', manejarTecla);
    return () => window.removeEventListener('keydown', manejarTecla);
  }, []);

  return (
    <section className="vista-juego animacion-entrada">
      <div className="cabecera-juego">
        <div>
          <button className="boton-volver" onClick={volverSalaEspera} type="button">
            <ArrowLeft size={16} />
            Sala de espera
          </button>
          <span className="etiqueta-vista">Campo de batalla</span>
          <h2>{obtenerNombreGalaxia(partida)}</h2>
          <p>
            Comandante <strong>{nickname || 'sin identificar'}</strong>, esta es la interfaz tactica inicial para visualizar
            sistemas, rutas, recursos, propietarios, flotas e infraestructura.
          </p>
        </div>

        <div className="acciones-cabecera-juego">
          <button type="button" onClick={() => cargarPartida()} disabled={cargando}>
            <RefreshCcw size={15} />
            {cargando ? 'Sincronizando' : 'Sincronizar'}
          </button>
          <button type="button" onClick={volverAlMenu}>
            <Radio size={15} />
            Menu
          </button>
        </div>
      </div>

      {mensaje && <div className="mensaje-juego">{mensaje}</div>}

      <div className="tablero-juego">
        <aside className="panel-juego panel-comandante">
          <div className="titulo-panel-juego">
            <Shield size={15} />
            <span>Comandante</span>
            <div />
          </div>

          <div className="tarjeta-comandante-juego">
            <strong>{jugadorActual?.nickname || nickname || 'Sin registro'}</strong>
            <span>{jugadorActual?.id || 'Jugador no identificado'}</span>
          </div>

          <div className="recursos-juego">
            <div>
              <Boxes size={16} />
              <span>Minerales</span>
              <strong>{jugadorActual?.recursos?.minerales ?? 0}</strong>
            </div>
            <div>
              <Zap size={16} />
              <span>Energia</span>
              <strong>{jugadorActual?.recursos?.energia ?? 0}</strong>
            </div>
            <div>
              <Cpu size={16} />
              <span>Cristales</span>
              <strong>{jugadorActual?.recursos?.cristales ?? 0}</strong>
            </div>
          </div>

          <div className="indicadores-juego">
            <div>
              <span>Sistemas controlados</span>
              <strong>{sistemasControlados}/{sistemas.length || 0}</strong>
            </div>
            <div>
              <span>Estado de partida</span>
              <strong>{partida?.estado || 'cargando'}</strong>
            </div>
            <div>
              <span>Tecla U</span>
              <strong>{teclaUDetectada ? 'Detectada' : 'Pendiente'}</strong>
            </div>
          </div>

          <div className={teclaUDetectada ? 'aviso-tecla-u activo' : 'aviso-tecla-u'}>
            <Timer size={17} />
            <div>
              <strong>{teclaUDetectada ? 'Orden U registrada' : 'Presione U para armar inicio'}</strong>
              <span>La cuenta regresiva real se conectara en la segunda parte de esta vista.</span>
            </div>
          </div>
        </aside>

        <div className="panel-mapa-juego">
          <div className="barra-mapa-juego">
            <div>
              <Orbit size={16} />
              <span>Mapa galactico</span>
            </div>
            <strong>{sistemas.length} sistemas / {rutas.length} rutas</strong>
          </div>

          <div className="mapa-galactico-juego">
            <svg className="rutas-galacticas" viewBox="0 0 100 100" preserveAspectRatio="none">
              {rutas.map((ruta, indice) => {
                const extremos = obtenerExtremosRuta(ruta);
                const origen = posicionesSistemas[extremos.origen];
                const destino = posicionesSistemas[extremos.destino];

                if (!origen || !destino) {
                  return null;
                }

                return (
                  <line
                    key={`${extremos.origen}-${extremos.destino}-${indice}`}
                    x1={origen.x}
                    y1={origen.y}
                    x2={destino.x}
                    y2={destino.y}
                    className="ruta-galactica"
                  />
                );
              })}
            </svg>

            {sistemas.map((sistema) => {
              const posicion = posicionesSistemas[sistema.id] || { x: 50, y: 50 };
              const claseSistema = obtenerClaseSistema(sistema, jugadorActual);
              const seleccionado = sistema.id === sistemaSeleccionado?.id;

              return (
                <button
                  key={sistema.id}
                  type="button"
                  className={`nodo-sistema-juego ${claseSistema} ${seleccionado ? 'seleccionado' : ''}`}
                  style={{ left: `${posicion.x}%`, top: `${posicion.y}%` }}
                  onClick={() => setIdSistemaSeleccionado(sistema.id)}
                  title={sistema.nombre}
                >
                  <span>{sistema.id.replace('S', '')}</span>
                  <em>{sistema.nombre}</em>
                </button>
              );
            })}
          </div>

          <div className="leyenda-mapa-juego">
            <span><i className="punto-leyenda propio" /> Propio</span>
            <span><i className="punto-leyenda enemigo" /> Enemigo</span>
            <span><i className="punto-leyenda neutral" /> Neutral</span>
          </div>
        </div>

        <aside className="panel-juego panel-sistema">
          <div className="titulo-panel-juego">
            <Crosshair size={15} />
            <span>Sistema seleccionado</span>
            <div />
          </div>

          <div className="tarjeta-sistema-juego">
            <span>{sistemaSeleccionado?.id || 'Sin sistema'}</span>
            <strong>{sistemaSeleccionado?.nombre || 'Seleccione un sistema'}</strong>
            <p>{sistemaSeleccionado?.descripcion || 'La informacion del sistema aparecera al seleccionarlo en el mapa.'}</p>
          </div>

          <div className="detalle-sistema-juego">
            <div>
              <span>Tipo</span>
              <strong>{sistemaSeleccionado?.tipo || 'No definido'}</strong>
            </div>
            <div>
              <span>Propietario</span>
              <strong>{obtenerNombrePropietario(sistemaSeleccionado, jugadores)}</strong>
            </div>
            <div>
              <span>Flotas</span>
              <strong>{sistemaSeleccionado?.flotas ?? 0}</strong>
            </div>
            <div>
              <span>Exploracion</span>
              <strong>{sistemaSeleccionado?.estadoExploracion || 'no explorado'}</strong>
            </div>
          </div>

          <div className="produccion-juego">
            <strong>Produccion por ciclo</strong>
            <div>
              <span>Minerales</span>
              <em>{produccionSeleccionada.minerales}</em>
            </div>
            <div>
              <span>Energia</span>
              <em>{produccionSeleccionada.energia}</em>
            </div>
            <div>
              <span>Cristales</span>
              <em>{produccionSeleccionada.cristales}</em>
            </div>
          </div>

          <div className="infraestructura-juego">
            <strong>Infraestructura</strong>
            <div><span>Minas</span><em>{sistemaSeleccionado?.instalaciones?.minas ?? 0}</em></div>
            <div><span>Centros</span><em>{sistemaSeleccionado?.instalaciones?.centrosInvestigacion ?? 0}</em></div>
            <div><span>Astilleros</span><em>{sistemaSeleccionado?.instalaciones?.astilleros ?? 0}</em></div>
            <div><span>Fortalezas</span><em>{sistemaSeleccionado?.instalaciones?.fortalezas ?? 0}</em></div>
          </div>
        </aside>
      </div>

      <div className="franja-inferior-juego">
        <div className="panel-acciones-juego">
          <div className="titulo-panel-juego">
            <Hammer size={15} />
            <span>Construccion</span>
            <div />
          </div>
          <div className="botones-acciones-juego">
            <button type="button" disabled>Mina</button>
            <button type="button" disabled>Centro investigacion</button>
            <button type="button" disabled>Astillero</button>
            <button type="button" disabled>Fortaleza</button>
          </div>
          <p>La interfaz queda preparada. En la segunda parte se conectaran estos botones con el backend.</p>
        </div>

        <div className="panel-acciones-juego">
          <div className="titulo-panel-juego">
            <Swords size={15} />
            <span>Flotas y conquista</span>
            <div />
          </div>
          <div className="botones-acciones-juego">
            <button type="button" disabled>Seleccionar origen</button>
            <button type="button" disabled>Seleccionar destino</button>
            <button type="button" disabled>Mover flotas</button>
          </div>
          <p>El mapa ya permite seleccionar sistemas. Luego se agregara el flujo de origen, destino y cantidad.</p>
        </div>

        <div className="panel-eventos-juego">
          <div className="titulo-panel-juego">
            <Rocket size={15} />
            <span>Eventos recientes</span>
            <div />
          </div>
          <div className="lista-eventos-juego">
            {(partida?.eventos || []).slice(-6).map((evento, indice) => (
              <span key={`${evento}-${indice}`}>{evento}</span>
            ))}
            {(!partida?.eventos || partida.eventos.length === 0) && <span>Sin eventos registrados todavia.</span>}
          </div>
        </div>
      </div>
    </section>
  );
}
