/*
    Archivo: CrearPartida.tsx
    Descripcion: Vista para crear una partida nueva desde el frontend.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Clock, Copy, Lock, Rocket, Satellite, Shield, Users, Zap } from 'lucide-react';
import { obtenerGalaxias } from '../servicios/servicioGalaxias';
import { crearPartida, unirsePartida } from '../servicios/servicioPartidas';
import { GalaxiaResumen, NivelRecursosIniciales, PartidaDetalle } from '../tipos/tiposJuego';

interface PropiedadesCrearPartida {
  nickname: string;
  volverAlMenu: () => void;
  abrirSalaEspera: (idPartida: string, idJugador?: string) => void;
}

interface RecursosInicialesVista {
  minerales: number;
  energia: number;
  cristales: number;
}

const recursosIniciales: Record<NivelRecursosIniciales, RecursosInicialesVista> = {
  bajo: { minerales: 100, energia: 50, cristales: 20 },
  normal: { minerales: 300, energia: 150, cristales: 50 },
  alto: { minerales: 500, energia: 250, cristales: 100 }
};

/*
     obtenerNombreGalaxia
    Entradas: Partida creada y galaxia seleccionada.
    Salidas: Nombre de la galaxia.
    Objetivo: Mostrar el nombre correcto de galaxia aunque el backend envie resumen o detalle.
*/
function obtenerNombreGalaxia(partida: PartidaDetalle | null, galaxiaSeleccionada?: GalaxiaResumen): string {
  if (!partida) {
    return galaxiaSeleccionada?.nombre || 'Sin seleccionar';
  }

  if (typeof partida.galaxia === 'string') {
    return partida.galaxia;
  }

  return partida.galaxia?.nombre || galaxiaSeleccionada?.nombre || 'Sin seleccionar';
}

/*
     CrearPartida
    Entradas: Nickname del jugador y funcion para volver al menu.
    Salidas: Retorna el formulario o la confirmacion de partida creada.
    Objetivo: Permitir configurar una partida y evitar creaciones repetidas desde la misma vista.
*/
export function CrearPartida({ nickname, volverAlMenu, abrirSalaEspera }: PropiedadesCrearPartida) {
  const [galaxias, setGalaxias] = useState<GalaxiaResumen[]>([]);
  const [nombre, setNombre] = useState('');
  const [idGalaxia, setIdGalaxia] = useState('');
  const [maxJugadores, setMaxJugadores] = useState(2);
  const [tiempoMaximoMinutos, setTiempoMaximoMinutos] = useState(30);
  const [nivelRecursosIniciales, setNivelRecursosIniciales] = useState<NivelRecursosIniciales>('normal');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [partidaCreada, setPartidaCreada] = useState<PartidaDetalle | null>(null);
  const [idCopiado, setIdCopiado] = useState(false);
  const [entrandoSala, setEntrandoSala] = useState(false);

  useEffect(() => {
    const cargarGalaxias = async () => {
      try {
        const datos = await obtenerGalaxias();
        setGalaxias(datos);

        if (datos.length > 0) {
          setIdGalaxia(datos[0].id);
        }
      } catch {
        setMensaje('No se pudieron cargar las galaxias. Revise que el backend este activo.');
      }
    };

    cargarGalaxias();
  }, []);

  /*
       validarFormulario
      Entradas: No recibe entradas.
      Salidas: Mensaje de error o texto vacio.
      Objetivo: Evitar enviar datos incompletos, invalidos o repetidos al backend.
  */
  const validarFormulario = (): string => {
    if (partidaCreada) {
      return 'Ya se creo una partida desde esta pantalla. Copie el codigo o vuelva al menu.';
    }

    if (!nickname.trim()) {
      return 'Debe ingresar un nickname desde el menu principal.';
    }

    if (nombre.trim().length < 3) {
      return 'El nombre de la partida debe tener al menos 3 caracteres.';
    }

    if (!idGalaxia) {
      return 'Debe seleccionar una galaxia.';
    }

    if (maxJugadores < 2 || maxJugadores > 8) {
      return 'La cantidad maxima de jugadores debe estar entre 2 y 8.';
    }

    if (tiempoMaximoMinutos < 5 || tiempoMaximoMinutos > 180) {
      return 'El tiempo maximo debe estar entre 5 y 180 minutos.';
    }

    return '';
  };

  /*
       manejarCreacion
      Entradas: Evento del formulario.
      Salidas: No retorna valor.
      Objetivo: Crear la partida llamando al servicio HTTP correspondiente una sola vez.
  */
  const manejarCreacion = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const error = validarFormulario();

    if (error) {
      setMensaje(error);
      return;
    }

    try {
      setCargando(true);
      setMensaje('Creando partida...');

      const partida = await crearPartida({
        nombre: nombre.trim(),
        idGalaxia,
        maxJugadores,
        tiempoMaximoMinutos,
        nivelRecursosIniciales
      });

      setPartidaCreada(partida);
      setMensaje('Partida creada correctamente. El formulario fue bloqueado para evitar duplicados.');
    } catch (error: any) {
      setMensaje(error.message || 'No se pudo crear la partida.');
    } finally {
      setCargando(false);
    }
  };

  /*
       copiarIdPartida
      Entradas: No recibe entradas.
      Salidas: No retorna valor.
      Objetivo: Copiar el identificador de la partida creada al portapapeles.
  */
  const copiarIdPartida = async () => {
    if (!partidaCreada) return;

    try {
      await navigator.clipboard.writeText(partidaCreada.id);
      setIdCopiado(true);
      setTimeout(() => setIdCopiado(false), 1600);
    } catch {
      setMensaje('No se pudo copiar el identificador automaticamente. Puede seleccionarlo manualmente.');
    }
  };

  /*
       manejarEntradaSala
      Entradas: No recibe entradas.
      Salidas: No retorna valor.
      Objetivo: Registrar al creador como jugador y abrir la sala de espera.
  */
  const manejarEntradaSala = async () => {
    if (!partidaCreada) {
      return;
    }

    try {
      setEntrandoSala(true);
      setMensaje('Registrando al creador en la sala de espera...');
      const partidaActualizada = await unirsePartida(partidaCreada.id, nickname.trim());
      const jugador = (partidaActualizada.jugadores || []).find(
        (dato) => dato.nickname.trim().toLowerCase() === nickname.trim().toLowerCase()
      );

      abrirSalaEspera(partidaActualizada.id, jugador?.id);
    } catch (error: any) {
      if (String(error.message || '').toLowerCase().includes('nickname')) {
        abrirSalaEspera(partidaCreada.id);
        return;
      }

      setMensaje(error.message || 'No se pudo entrar a la sala de espera.');
    } finally {
      setEntrandoSala(false);
    }
  };

  const recursosSeleccionados = recursosIniciales[nivelRecursosIniciales];
  const galaxiaSeleccionada = galaxias.find((galaxia) => galaxia.id === idGalaxia);
  const nombreGalaxia = obtenerNombreGalaxia(partidaCreada, galaxiaSeleccionada);

  if (partidaCreada) {
    return (
      <section className="vista-formulario animacion-entrada">
        <div className="cabecera-vista">
          <button className="boton-volver" onClick={volverAlMenu} type="button">
            <ArrowLeft size={16} />
            Volver al menu
          </button>
          <span className="etiqueta-vista">Partida registrada</span>
          <h2>Codigo de acceso generado</h2>
          <p>
            Comandante <strong>{nickname}</strong>, la sala fue creada correctamente. Comparta el identificador
            con sus compañeros para que puedan ingresar desde la vista de unirse a partida.
          </p>
        </div>

        <div className="rejilla-confirmacion-creacion">
          <div className="panel-confirmacion-partida">
            <div className="icono-confirmacion">
              <CheckCircle size={34} />
            </div>
            <span className="etiqueta-vista">Sala en espera</span>
            <h3>{partidaCreada.nombre}</h3>
            <div className="codigo-grande-partida">
              <code>{partidaCreada.id}</code>
              <button type="button" onClick={copiarIdPartida}>
                <Copy size={15} />
                {idCopiado ? 'Copiado' : 'Copiar codigo'}
              </button>
            </div>
            <p>
              Este codigo identifica la partida en el servidor. Tambien se puede compartir con los demas jugadores
              para que entren desde la vista de unirse a partida.
            </p>
            <button className="boton-principal boton-entrada-sala" type="button" onClick={manejarEntradaSala} disabled={entrandoSala}>
              <Users size={16} />
              {entrandoSala ? 'Entrando a sala...' : 'Entrar a sala de espera'}
            </button>
          </div>

          <aside className="panel-resumen-creacion">
            <div className="tarjeta-resumen-creacion">
              <div className="titulo-resumen-creacion">
                <Satellite size={15} />
                <span>Resumen tactico</span>
                <div />
              </div>
              <div className="linea-resumen">
                <span>Galaxia</span>
                <strong>{nombreGalaxia}</strong>
              </div>
              <div className="linea-resumen">
                <span>Jugadores</span>
                <strong>{partidaCreada.jugadoresActuales}/{partidaCreada.maxJugadores}</strong>
              </div>
              <div className="linea-resumen">
                <span>Estado</span>
                <strong>{partidaCreada.estado}</strong>
              </div>
              <div className="linea-resumen">
                <span>Duracion</span>
                <strong>{tiempoMaximoMinutos} min</strong>
              </div>
            </div>

            <div className="tarjeta-resumen-creacion">
              <div className="titulo-resumen-creacion">
                <Shield size={15} />
                <span>Recursos iniciales</span>
                <div />
              </div>
              <div className="recursos-resumen">
                <div><span>Minerales</span><strong>{recursosSeleccionados.minerales}</strong></div>
                <div><span>Energia</span><strong>{recursosSeleccionados.energia}</strong></div>
                <div><span>Cristales</span><strong>{recursosSeleccionados.cristales}</strong></div>
              </div>
            </div>

            <div className="aviso-creacion">
              <Lock size={15} />
              <p>
                El formulario queda oculto para evitar que el usuario envie la misma configuracion muchas veces
                por accidente. Para crear otra sala debe volver al menu y entrar nuevamente.
              </p>
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
        <span className="etiqueta-vista">Modulo de partida</span>
        <h2>Crear partida</h2>
        <p>
          Comandante <strong>{nickname || 'sin identificar'}</strong>, configure una sala de conquista
          galactica. El backend generara un identificador unico para que otros jugadores puedan unirse.
        </p>
      </div>

      <div className="rejilla-formulario">
        <form className="panel-formulario" onSubmit={manejarCreacion}>
          <div className="encabezado-panel-formulario">
            <Rocket size={16} />
            <span>Configuracion principal</span>
            <div />
          </div>

          <div className="grupo-campo">
            <label>Nombre de la partida</label>
            <input
              type="text"
              value={nombre}
              onChange={(evento) => setNombre(evento.target.value)}
              placeholder="Ejemplo: Guerra de Orion"
              maxLength={40}
            />
          </div>

          <div className="grupo-campo">
            <label>Galaxia por utilizar</label>
            <select value={idGalaxia} onChange={(evento) => setIdGalaxia(evento.target.value)}>
              {galaxias.length === 0 && <option value="">No hay galaxias disponibles</option>}
              {galaxias.map((galaxia) => (
                <option key={galaxia.id} value={galaxia.id}>{galaxia.nombre}</option>
              ))}
            </select>
          </div>

          <div className="campos-dobles">
            <div className="grupo-campo">
              <label>Maximo de jugadores</label>
              <input
                type="number"
                min={2}
                max={8}
                value={maxJugadores}
                onChange={(evento) => setMaxJugadores(Number(evento.target.value))}
              />
            </div>

            <div className="grupo-campo">
              <label>Tiempo maximo</label>
              <input
                type="number"
                min={5}
                max={180}
                value={tiempoMaximoMinutos}
                onChange={(evento) => setTiempoMaximoMinutos(Number(evento.target.value))}
              />
              <small>Minutos</small>
            </div>
          </div>

          <div className="grupo-campo">
            <label>Recursos iniciales</label>
            <div className="selector-recursos">
              {(['bajo', 'normal', 'alto'] as NivelRecursosIniciales[]).map((nivel) => (
                <button
                  key={nivel}
                  type="button"
                  className={nivelRecursosIniciales === nivel ? 'opcion-recurso activa' : 'opcion-recurso'}
                  onClick={() => setNivelRecursosIniciales(nivel)}
                >
                  <strong>{nivel}</strong>
                  <span>
                    M {recursosIniciales[nivel].minerales} / E {recursosIniciales[nivel].energia} / C {recursosIniciales[nivel].cristales}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {mensaje && <div className="mensaje-formulario">{mensaje}</div>}

          <button className="boton-principal" type="submit" disabled={cargando}>
            <Zap size={16} />
            {cargando ? 'Creando...' : 'Crear partida'}
          </button>
        </form>

        <aside className="panel-resumen-creacion">
          <div className="tarjeta-resumen-creacion">
            <div className="titulo-resumen-creacion">
              <Satellite size={15} />
              <span>Resumen tactico</span>
              <div />
            </div>
            <div className="linea-resumen">
              <span>Galaxia</span>
              <strong>{nombreGalaxia}</strong>
            </div>
            <div className="linea-resumen">
              <span>Sistemas</span>
              <strong>{galaxiaSeleccionada?.sistemas?.length || galaxiaSeleccionada?.cantidadSistemas || 0}</strong>
            </div>
            <div className="linea-resumen">
              <span>Rutas</span>
              <strong>{galaxiaSeleccionada?.rutas?.length || galaxiaSeleccionada?.cantidadRutas || 0}</strong>
            </div>
            <div className="linea-resumen">
              <span>Jugadores</span>
              <strong>{maxJugadores}</strong>
            </div>
            <div className="linea-resumen">
              <span>Duracion</span>
              <strong>{tiempoMaximoMinutos} min</strong>
            </div>
          </div>

          <div className="tarjeta-resumen-creacion">
            <div className="titulo-resumen-creacion">
              <Shield size={15} />
              <span>Recursos iniciales</span>
              <div />
            </div>
            <div className="recursos-resumen">
              <div><span>Minerales</span><strong>{recursosSeleccionados.minerales}</strong></div>
              <div><span>Energia</span><strong>{recursosSeleccionados.energia}</strong></div>
              <div><span>Cristales</span><strong>{recursosSeleccionados.cristales}</strong></div>
            </div>
          </div>

          <div className="aviso-creacion">
            <Clock size={15} />
            <p>
              La partida queda en estado de espera. Si no se completa la cantidad minima de jugadores,
              el backend puede cerrarla automaticamente segun la configuracion del servidor.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
