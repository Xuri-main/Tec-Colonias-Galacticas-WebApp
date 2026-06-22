/*
    Archivo: MenuPrincipal.tsx
    Descripcion: Primera vista de la aplicacion para ingresar nickname y elegir accion principal.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { useEffect, useState } from 'react';
import { Activity, Crosshair, Globe, Shield, Trophy, Users, Zap } from 'lucide-react';
import { ChipEstadistica } from '../componentes/interfaz/ChipEstadistica';
import { TarjetaAccion } from '../componentes/interfaz/TarjetaAccion';
import { IndicadorEstado } from '../componentes/interfaz/IndicadorEstado';
import { FilaRanking } from '../componentes/interfaz/FilaRanking';
import { obtenerPartidas } from '../servicios/servicioPartidas';
import { obtenerRanking } from '../servicios/servicioRanking';
import { RankingItem, VistaAplicacion } from '../tipos/tiposJuego';

interface PropiedadesMenuPrincipal {
  nickname: string;
  cambiarNickname: (valor: string) => void;
  cambiarVista: (vista: VistaAplicacion) => void;
}

/*
     MenuPrincipal
    Entradas: Nickname actual, funcion para cambiarlo y funcion para cambiar de vista.
    Salidas: Retorna el menu principal del juego.
    Objetivo: Permitir el ingreso del jugador y mostrar las acciones principales del cliente.
*/
export function MenuPrincipal({ nickname, cambiarNickname, cambiarVista }: PropiedadesMenuPrincipal) {
  const [entradaActiva, setEntradaActiva] = useState(false);
  const [cantidadPartidas, setCantidadPartidas] = useState(0);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [servidorActivo, setServidorActivo] = useState(false);
  const nicknameValido = nickname.trim().length > 0;

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const partidas = await obtenerPartidas();
        const rankingActual = await obtenerRanking();
        setCantidadPartidas(partidas.length);
        setRanking(rankingActual.slice(0, 3));
        setServidorActivo(true);
      } catch {
        setServidorActivo(false);
      }
    };

    cargarDatos();
  }, []);

  const rankingVisible = ranking.length > 0
    ? ranking.map((item, indice) => ({
        posicion: indice + 1,
        nombre: item.nombreGanador,
        puntaje: String(item.puntaje || item.sistemasControlados * 5000)
      }))
    : [
        { posicion: 1, nombre: 'Sin registros', puntaje: '0' },
        { posicion: 2, nombre: 'Esperando partidas', puntaje: '0' },
        { posicion: 3, nombre: 'Ranking vacio', puntaje: '0' }
      ];

  return (
    <section className="menu-principal">
      <div className="bloque-hero animacion-entrada">
        <div className="insignia-juego">
          <span />
          <strong>Multijugador en tiempo real</strong>
        </div>

        <h1 className="titulo-juego">
          GALACTIC
          <span>COLONIES</span>
        </h1>

        <p className="descripcion-juego">
          Dirige tu flota, administra recursos y conquista sistemas planetarios en una galaxia
          compartida donde cada decision puede cambiar el control del universo.
        </p>

        <div className="banda-estadisticas">
          <ChipEstadistica valor="25+" etiqueta="Sistemas" />
          <div className="separador-estadistica" />
          <ChipEstadistica valor="40+" etiqueta="Rutas" />
          <div className="separador-estadistica" />
          <ChipEstadistica valor={`${cantidadPartidas}`} etiqueta="Partidas" />
          <div className="separador-estadistica" />
          <ChipEstadistica valor="3" etiqueta="Recursos" />
        </div>

        <div className="etiquetas-caracteristicas">
          <span>Control territorial</span>
          <span>Recursos</span>
          <span>Flotas</span>
          <span>Conquista</span>
        </div>
      </div>

      <div className="zona-paneles animacion-entrada-retardada">
        <div className="panel-comando">
          <span className="marco-esquina arriba-izquierda" />
          <span className="marco-esquina arriba-derecha" />
          <span className="marco-esquina abajo-izquierda" />
          <span className="marco-esquina abajo-derecha" />

          <div className="encabezado-panel">
            <Shield size={16} />
            <span>Identidad del comandante</span>
            <div />
          </div>

          <div className="campo-nickname">
            <label>Pilot ID / Nombre de jugador</label>
            <div className="entrada-nickname">
              <Crosshair size={14} className={entradaActiva ? 'icono-activo' : ''} />
              <input
                type="text"
                value={nickname}
                onChange={(evento) => cambiarNickname(evento.target.value)}
                onFocus={() => setEntradaActiva(true)}
                onBlur={() => setEntradaActiva(false)}
                placeholder="Escriba su nickname..."
                maxLength={24}
              />
              {nicknameValido && <Activity size={13} className="confirmacion-nickname" />}
            </div>
            {!nicknameValido && <p>Ingrese un nickname para activar el menu.</p>}
          </div>

          <div className="acciones-principales">
            <TarjetaAccion
              icono={Zap}
              titulo="Crear partida"
              descripcion="Configure una nueva sesion de conquista galactica."
              color="cyan"
              deshabilitada={!nicknameValido}
              alPresionar={() => cambiarVista('crear-partida')}
            />
            <TarjetaAccion
              icono={Globe}
              titulo="Unirse a partida"
              descripcion="Busque partidas disponibles y entre a una sala de espera."
              color="magenta"
              deshabilitada={!nicknameValido}
              alPresionar={() => cambiarVista('unirse-partida')}
            />
            <TarjetaAccion
              icono={Trophy}
              titulo="Ver ranking"
              descripcion="Consulte los ganadores historicos y mejores comandantes."
              color="ambar"
              deshabilitada={!nicknameValido}
              alPresionar={() => cambiarVista('ranking')}
            />
          </div>
        </div>

        <div className="panel-secundario">
          <div className="titulo-panel-secundario">
            <Trophy size={13} />
            <span>Top comandantes</span>
            <div />
            <small>LIVE</small>
          </div>
          {rankingVisible.map((item) => (
            <FilaRanking
              key={`${item.posicion}-${item.nombre}`}
              posicion={item.posicion}
              nombre={item.nombre}
              puntaje={item.puntaje}
            />
          ))}
        </div>

        <div className="panel-estado-servidor">
          <div>
            <IndicadorEstado activo={servidorActivo} />
            <span>{servidorActivo ? 'Backend conectado' : 'Backend sin conexion'}</span>
          </div>
          <div>
            <Users size={11} />
            <span>{cantidadPartidas} partidas activas</span>
          </div>
        </div>
      </div>
    </section>
  );
}
