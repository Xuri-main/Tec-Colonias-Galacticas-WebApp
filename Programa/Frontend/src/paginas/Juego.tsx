/*
    Archivo: Juego.tsx
    Descripcion: Vista principal del juego con mapa galactico, paneles de informacion y controles tacticos.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Boxes, Cpu, Crosshair, Hammer, Orbit, Radio, RefreshCcw, Rocket, Shield, Swords, Timer, Zap } from 'lucide-react';
import { construirEnPartida, moverFlotasEnPartida, obtenerPartidaPorId } from '../servicios/servicioPartidas';
import { GalaxiaResumen, JugadorResumen, PartidaDetalle, Recursos, RutaResumen, SistemaResumen, TipoConstruccion } from '../tipos/tiposJuego';

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

const costosConstruccion: Record<TipoConstruccion, Recursos> = {
  mina: { minerales: 100, energia: 0, cristales: 0 },
  centroInvestigacion: { minerales: 80, energia: 50, cristales: 200 },
  astillero: { minerales: 150, energia: 100, cristales: 10 },
  fortaleza: { minerales: 200, energia: 100, cristales: 30 }
};

const nombresConstruccion: Record<TipoConstruccion, string> = {
  mina: 'Mina',
  centroInvestigacion: 'Centro investigacion',
  astillero: 'Astillero',
  fortaleza: 'Fortaleza'
};

const descripcionConstruccion: Record<TipoConstruccion, string> = {
  mina: 'Aumenta la infraestructura minera del sistema.',
  centroInvestigacion: 'Mejora la produccion por ciclo mediante centrales.',
  astillero: 'Agrega una flota militar estacionada.',
  fortaleza: 'Refuerza la defensa del sistema.'
};

const listaConstrucciones: TipoConstruccion[] = ['mina', 'centroInvestigacion', 'astillero', 'fortaleza'];

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
    Entradas: Sistema, jugador actual, origen y destino de flotas.
    Salidas: Clase CSS del nodo.
    Objetivo: Diferenciar visualmente sistemas propios, enemigos, neutrales y sistemas marcados para movimiento.
*/
function obtenerClaseSistema(sistema: SistemaResumen, jugadorActual: JugadorResumen | undefined, idOrigen: string, idDestino: string): string {
  let clase = 'neutral';

  if (sistema.propietarioId) {
    clase = jugadorActual && sistema.propietarioId === jugadorActual.id ? 'propio' : 'enemigo';
  }

  if (sistema.id === idOrigen) {
    clase += ' origen-flotas';
  }

  if (sistema.id === idDestino) {
    clase += ' destino-flotas';
  }

  return clase;
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
     puedePagar
    Entradas: Recursos actuales y costo.
    Salidas: Verdadero si el jugador posee los recursos necesarios.
    Objetivo: Deshabilitar acciones de construccion imposibles desde la interfaz.
*/
function puedePagar(recursos: Recursos | undefined, costo: Recursos): boolean {
  if (!recursos) {
    return false;
  }

  return recursos.minerales >= costo.minerales && recursos.energia >= costo.energia && recursos.cristales >= costo.cristales;
}

/*
     esSistemaPropio
    Entradas: Sistema y jugador actual.
    Salidas: Verdadero si el sistema pertenece al jugador.
    Objetivo: Validar construcciones y origenes de flotas.
*/
function esSistemaPropio(sistema: SistemaResumen | null | undefined, jugadorActual: JugadorResumen | undefined): boolean {
  return Boolean(sistema && jugadorActual && sistema.propietarioId === jugadorActual.id);
}

/*
     existeRutaDirecta
    Entradas: Rutas, id de origen e id de destino.
    Salidas: Verdadero si ambos sistemas estan conectados directamente.
    Objetivo: Validar movimientos antes de enviarlos al backend.
*/
function existeRutaDirecta(rutas: RutaResumen[], origenId: string, destinoId: string): boolean {
  if (!origenId || !destinoId) {
    return false;
  }

  return rutas.some((ruta) => {
    const extremos = obtenerExtremosRuta(ruta);
    return (extremos.origen === origenId && extremos.destino === destinoId) || (extremos.origen === destinoId && extremos.destino === origenId);
  });
}

/*
     obtenerNombreSistema
    Entradas: Sistemas e id de sistema.
    Salidas: Nombre visible del sistema.
    Objetivo: Mostrar origen y destino seleccionados con nombres entendibles.
*/
function obtenerNombreSistema(sistemas: SistemaResumen[], sistemaId: string): string {
  const sistema = sistemas.find((actual) => actual.id === sistemaId);
  return sistema ? `${sistema.nombre} (${sistema.id})` : 'No seleccionado';
}

/*
     describirCosto
    Entradas: Costo de construccion.
    Salidas: Texto con minerales, energia y cristales.
    Objetivo: Mostrar el costo de manera compacta en los botones.
*/
function describirCosto(costo: Recursos): string {
  return `M ${costo.minerales} / E ${costo.energia} / C ${costo.cristales}`;
}

/*
     Juego
    Entradas: Nickname, id de partida, id de jugador y funciones de navegacion.
    Salidas: Retorna la interfaz principal del juego.
    Objetivo: Mostrar el mapa galactico y permitir construir, mover flotas y ejecutar conquistas.
*/
export function Juego({ nickname, idPartida, idJugadorActual, volverSalaEspera, volverAlMenu }: PropiedadesJuego) {
  const [partida, setPartida] = useState<PartidaDetalle | null>(null);
  const [idSistemaSeleccionado, setIdSistemaSeleccionado] = useState('');
  const [idOrigenFlotas, setIdOrigenFlotas] = useState('');
  const [idDestinoFlotas, setIdDestinoFlotas] = useState('');
  const [cantidadFlotas, setCantidadFlotas] = useState(1);
  const [mensaje, setMensaje] = useState('Cargando campo galactico...');
  const [cargando, setCargando] = useState(false);
  const [procesandoAccion, setProcesandoAccion] = useState(false);
  const [juegoHabilitado, setJuegoHabilitado] = useState(false);
  const [cuentaRegresiva, setCuentaRegresiva] = useState<number | null>(null);

  const sistemas = useMemo(() => obtenerSistemas(partida), [partida]);
  const rutas = useMemo(() => obtenerRutas(partida), [partida]);
  const jugadorActual = obtenerJugadorActual(partida, nickname, idJugadorActual);
  const sistemaSeleccionado = sistemas.find((sistema) => sistema.id === idSistemaSeleccionado) || sistemas[0] || null;
  const origenFlotas = sistemas.find((sistema) => sistema.id === idOrigenFlotas) || null;
  const destinoFlotas = sistemas.find((sistema) => sistema.id === idDestinoFlotas) || null;
  const produccionSeleccionada = obtenerProduccion(sistemaSeleccionado?.tipo);
  const sistemasControlados = contarSistemasJugador(sistemas, jugadorActual);
  const jugadores = partida?.jugadores || [];
  const sistemaSeleccionadoPropio = esSistemaPropio(sistemaSeleccionado, jugadorActual);
  const origenValido = esSistemaPropio(origenFlotas, jugadorActual);
  const rutaValida = existeRutaDirecta(rutas, idOrigenFlotas, idDestinoFlotas);
  const cantidadDisponible = origenFlotas?.flotas || 0;
  const accionesBloqueadas = !juegoHabilitado || partida?.estado !== 'iniciada' || procesandoAccion;

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

      if (!silencioso) {
        setMensaje('Estado galactico sincronizado con el servidor.');
      }

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
        prepararInicioOperativo();
      }
    };

    window.addEventListener('keydown', manejarTecla);
    return () => window.removeEventListener('keydown', manejarTecla);
  }, [partida, juegoHabilitado, cuentaRegresiva]);

  useEffect(() => {
    if (cuentaRegresiva === null) {
      return;
    }

    if (cuentaRegresiva <= 0) {
      setCuentaRegresiva(null);
      setJuegoHabilitado(true);
      setMensaje('Cuenta regresiva finalizada. Operaciones tacticas habilitadas.');
      return;
    }

    const temporizador = window.setTimeout(() => {
      setCuentaRegresiva(cuentaRegresiva - 1);
    }, 1000);

    return () => window.clearTimeout(temporizador);
  }, [cuentaRegresiva]);

  /*
       prepararInicioOperativo
      Entradas: No recibe entradas.
      Salidas: No retorna valor.
      Objetivo: Activar la cuenta regresiva local con la tecla U antes de permitir acciones.
  */
  const prepararInicioOperativo = () => {
    if (juegoHabilitado || cuentaRegresiva !== null) {
      return;
    }

    if (partida?.estado !== 'iniciada') {
      setMensaje('La partida todavia no esta iniciada desde la sala de espera.');
      return;
    }

    setCuentaRegresiva(3);
    setMensaje('Orden U recibida. Iniciando cuenta regresiva operativa.');
  };

  /*
       manejarSeleccionSistema
      Entradas: Id del sistema seleccionado en el mapa.
      Salidas: No retorna valor.
      Objetivo: Actualizar el sistema activo para inspeccion y acciones.
  */
  const manejarSeleccionSistema = (sistemaId: string) => {
    setIdSistemaSeleccionado(sistemaId);
  };

  /*
       construir
      Entradas: Tipo de construccion solicitado.
      Salidas: No retorna valor.
      Objetivo: Enviar al backend una orden de construccion validando datos basicos en interfaz.
  */
  const construir = async (tipoConstruccion: TipoConstruccion) => {
    if (accionesBloqueadas) {
      setMensaje('Debe presionar U y esperar la cuenta regresiva antes de ejecutar acciones.');
      return;
    }

    if (!jugadorActual) {
      setMensaje('No se encontro el jugador actual en la partida.');
      return;
    }

    if (!sistemaSeleccionado || !sistemaSeleccionadoPropio) {
      setMensaje('Seleccione un sistema propio para construir.');
      return;
    }

    const costo = costosConstruccion[tipoConstruccion];

    if (!puedePagar(jugadorActual.recursos, costo)) {
      setMensaje('Recursos insuficientes para ejecutar esta construccion.');
      return;
    }

    try {
      setProcesandoAccion(true);
      setMensaje(`Construyendo ${nombresConstruccion[tipoConstruccion]} en ${sistemaSeleccionado.nombre}...`);
      const datos = await construirEnPartida(idPartida, jugadorActual.id, sistemaSeleccionado.id, tipoConstruccion);
      setPartida(datos);
      setMensaje(`${nombresConstruccion[tipoConstruccion]} construida correctamente en ${sistemaSeleccionado.nombre}.`);
    } catch (error: any) {
      setMensaje(error.message || 'No se pudo completar la construccion.');
    } finally {
      setProcesandoAccion(false);
    }
  };

  /*
       fijarOrigenFlotas
      Entradas: No recibe entradas.
      Salidas: No retorna valor.
      Objetivo: Usar el sistema seleccionado como origen del movimiento de flotas.
  */
  const fijarOrigenFlotas = () => {
    if (!sistemaSeleccionado || !esSistemaPropio(sistemaSeleccionado, jugadorActual)) {
      setMensaje('El origen debe ser un sistema controlado por su comandante.');
      return;
    }

    setIdOrigenFlotas(sistemaSeleccionado.id);
    setCantidadFlotas(1);
    setMensaje(`${sistemaSeleccionado.nombre} marcado como origen de flotas.`);
  };

  /*
       fijarDestinoFlotas
      Entradas: No recibe entradas.
      Salidas: No retorna valor.
      Objetivo: Usar el sistema seleccionado como destino del movimiento de flotas.
  */
  const fijarDestinoFlotas = () => {
    if (!sistemaSeleccionado) {
      setMensaje('Seleccione un sistema del mapa para usarlo como destino.');
      return;
    }

    if (sistemaSeleccionado.id === idOrigenFlotas) {
      setMensaje('El destino debe ser diferente al origen.');
      return;
    }

    setIdDestinoFlotas(sistemaSeleccionado.id);
    setMensaje(`${sistemaSeleccionado.nombre} marcado como destino de flotas.`);
  };

  /*
       moverFlotas
      Entradas: No recibe entradas.
      Salidas: No retorna valor.
      Objetivo: Enviar al backend una orden de movimiento o conquista.
  */
  const moverFlotas = async () => {
    if (accionesBloqueadas) {
      setMensaje('Debe presionar U y esperar la cuenta regresiva antes de mover flotas.');
      return;
    }

    if (!jugadorActual) {
      setMensaje('No se encontro el jugador actual en la partida.');
      return;
    }

    if (!idOrigenFlotas || !idDestinoFlotas) {
      setMensaje('Debe seleccionar origen y destino para mover flotas.');
      return;
    }

    if (!origenValido) {
      setMensaje('El origen elegido no pertenece a su comandante.');
      return;
    }

    if (!rutaValida) {
      setMensaje('El origen y el destino no estan conectados directamente.');
      return;
    }

    if (cantidadFlotas <= 0 || cantidadFlotas > cantidadDisponible) {
      setMensaje('La cantidad de flotas debe ser mayor a cero y no puede superar las flotas disponibles.');
      return;
    }

    try {
      setProcesandoAccion(true);
      setMensaje('Enviando orden de movimiento de flotas al servidor...');
      const datos = await moverFlotasEnPartida(idPartida, jugadorActual.id, idOrigenFlotas, idDestinoFlotas, cantidadFlotas);
      setPartida(datos);
      setIdSistemaSeleccionado(idDestinoFlotas);
      setIdOrigenFlotas('');
      setIdDestinoFlotas('');
      setCantidadFlotas(1);
      setMensaje('Movimiento de flotas procesado correctamente. Revise los eventos recientes.');
    } catch (error: any) {
      setMensaje(error.message || 'No se pudo mover las flotas.');
    } finally {
      setProcesandoAccion(false);
    }
  };

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
            Comandante <strong>{nickname || 'sin identificar'}</strong>, administre recursos, construcciones y flotas
            desde esta consola tactica sincronizada con el servidor.
          </p>
        </div>

        <div className="acciones-cabecera-juego">
          <button type="button" onClick={() => cargarPartida()} disabled={cargando || procesandoAccion}>
            <RefreshCcw size={15} />
            {cargando ? 'Sincronizando' : 'Sincronizar'}
          </button>
          <button type="button" onClick={prepararInicioOperativo} disabled={juegoHabilitado || cuentaRegresiva !== null || partida?.estado !== 'iniciada'}>
            <Timer size={15} />
            {juegoHabilitado ? 'Operativo' : cuentaRegresiva !== null ? `Inicio ${cuentaRegresiva}` : 'Orden U'}
          </button>
          <button type="button" onClick={volverAlMenu}>
            <Radio size={15} />
            Menu
          </button>
        </div>
      </div>

      {mensaje && <div className="mensaje-juego">{mensaje}</div>}

      <div className={juegoHabilitado ? 'banda-operativa activa' : 'banda-operativa'}>
        <Timer size={17} />
        <div>
          <strong>
            {juegoHabilitado ? 'Operaciones habilitadas' : cuentaRegresiva !== null ? `Cuenta regresiva: ${cuentaRegresiva}` : 'Esperando tecla U'}
          </strong>
          <span>
            {juegoHabilitado
              ? 'Las ordenes de construccion, movimiento y conquista ya pueden enviarse al backend.'
              : 'Antes de ejecutar acciones tacticas, presione U para confirmar el inicio operativo de esta interfaz.'}
          </span>
        </div>
      </div>

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
              <span>Operacion local</span>
              <strong>{juegoHabilitado ? 'Activa' : 'Bloqueada'}</strong>
            </div>
          </div>

          <div className={juegoHabilitado ? 'aviso-tecla-u activo' : 'aviso-tecla-u'}>
            <Timer size={17} />
            <div>
              <strong>{juegoHabilitado ? 'Orden U completada' : 'Presione U para activar'}</strong>
              <span>
                Esta proteccion evita enviar acciones desde la interfaz antes de que el jugador confirme el arranque.
              </span>
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
                const marcada = (extremos.origen === idOrigenFlotas && extremos.destino === idDestinoFlotas) || (extremos.origen === idDestinoFlotas && extremos.destino === idOrigenFlotas);

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
                    className={marcada ? 'ruta-galactica marcada' : 'ruta-galactica'}
                  />
                );
              })}
            </svg>

            {sistemas.map((sistema) => {
              const posicion = posicionesSistemas[sistema.id] || { x: 50, y: 50 };
              const claseSistema = obtenerClaseSistema(sistema, jugadorActual, idOrigenFlotas, idDestinoFlotas);
              const seleccionado = sistema.id === sistemaSeleccionado?.id;

              return (
                <button
                  key={sistema.id}
                  type="button"
                  className={`nodo-sistema-juego ${claseSistema} ${seleccionado ? 'seleccionado' : ''}`}
                  style={{ left: `${posicion.x}%`, top: `${posicion.y}%` }}
                  onClick={() => manejarSeleccionSistema(sistema.id)}
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
            <span><i className="punto-leyenda origen" /> Origen</span>
            <span><i className="punto-leyenda destino" /> Destino</span>
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
        <div className="panel-acciones-juego panel-construccion-juego">
          <div className="titulo-panel-juego">
            <Hammer size={15} />
            <span>Construccion</span>
            <div />
          </div>

          {!sistemaSeleccionadoPropio && <p className="mensaje-bloqueo-acciones">Seleccione un sistema propio para habilitar construcciones.</p>}

          <div className="tarjetas-construccion-juego">
            {listaConstrucciones.map((tipo) => {
              const costo = costosConstruccion[tipo];
              const disponible = sistemaSeleccionadoPropio && puedePagar(jugadorActual?.recursos, costo) && !accionesBloqueadas;

              return (
                <button key={tipo} type="button" className="tarjeta-construccion-opcion" disabled={!disponible} onClick={() => construir(tipo)}>
                  <strong>{nombresConstruccion[tipo]}</strong>
                  <span>{descripcionConstruccion[tipo]}</span>
                  <em>{describirCosto(costo)}</em>
                </button>
              );
            })}
          </div>
        </div>

        <div className="panel-acciones-juego panel-flotas-juego">
          <div className="titulo-panel-juego">
            <Swords size={15} />
            <span>Flotas y conquista</span>
            <div />
          </div>

          <div className="selector-flotas-juego">
            <div>
              <span>Origen</span>
              <strong>{obtenerNombreSistema(sistemas, idOrigenFlotas)}</strong>
            </div>
            <button type="button" onClick={fijarOrigenFlotas} disabled={procesandoAccion || !sistemaSeleccionadoPropio}>
              Usar seleccionado
            </button>
          </div>

          <div className="selector-flotas-juego">
            <div>
              <span>Destino</span>
              <strong>{obtenerNombreSistema(sistemas, idDestinoFlotas)}</strong>
            </div>
            <button type="button" onClick={fijarDestinoFlotas} disabled={procesandoAccion || !sistemaSeleccionado || !idOrigenFlotas}>
              Usar seleccionado
            </button>
          </div>

          <div className="control-flotas-juego">
            <label htmlFor="cantidad-flotas">Cantidad de flotas</label>
            <input
              id="cantidad-flotas"
              type="number"
              min="1"
              max={Math.max(1, cantidadDisponible)}
              value={cantidadFlotas}
              onChange={(evento) => setCantidadFlotas(Number(evento.target.value))}
            />
            <span>Disponibles: {cantidadDisponible}</span>
          </div>

          <div className={rutaValida ? 'estado-ruta-juego valida' : 'estado-ruta-juego'}>
            <span>Ruta directa</span>
            <strong>{idOrigenFlotas && idDestinoFlotas ? rutaValida ? 'Valida' : 'No conectada' : 'Pendiente'}</strong>
          </div>

          <button className="boton-mover-flotas-juego" type="button" onClick={moverFlotas} disabled={accionesBloqueadas || !origenValido || !rutaValida || cantidadFlotas <= 0 || cantidadFlotas > cantidadDisponible}>
            <Rocket size={15} />
            Mover flotas
          </button>
        </div>

        <div className="panel-eventos-juego">
          <div className="titulo-panel-juego">
            <Rocket size={15} />
            <span>Eventos recientes</span>
            <div />
          </div>
          <div className="lista-eventos-juego">
            {(partida?.eventos || []).slice(-8).map((evento, indice) => (
              <span key={`${evento}-${indice}`}>{evento}</span>
            ))}
            {(!partida?.eventos || partida.eventos.length === 0) && <span>Sin eventos registrados todavia.</span>}
          </div>
        </div>
      </div>
    </section>
  );
}
