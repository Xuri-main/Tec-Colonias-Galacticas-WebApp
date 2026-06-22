/*
    Archivo: BarraSuperior.tsx
    Descripcion: Barra superior con estado del sistema y recursos principales.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { Cpu, Globe, Radio, Zap } from 'lucide-react';
import { IndicadorEstado } from './IndicadorEstado';
import { IconoRecurso } from './IconoRecurso';

/*
     BarraSuperior
    Entradas: No recibe entradas.
    Salidas: Retorna la barra superior de la interfaz.
    Objetivo: Mostrar identidad visual y estado general del sistema.
*/
export function BarraSuperior() {
  return (
    <header className="barra-superior">
      <div className="barra-superior-grupo">
        <div className="estado-sistema">
          <IndicadorEstado activo />
          <span>SYS ONLINE</span>
        </div>
        <div className="recursos-barra">
          <IconoRecurso icono={Zap} etiqueta="Energia" color="#FFC857" />
          <IconoRecurso icono={Globe} etiqueta="Minerales" color="#00E5FF" />
          <IconoRecurso icono={Cpu} etiqueta="Cristales" color="#FF2D95" />
        </div>
      </div>

      <div className="codigo-interfaz">
        <span>GC</span> / COMMAND INTERFACE / v1.0
      </div>

      <div className="estado-sistema ocultar-movil">
        <Radio size={12} />
        <span>Servidor local activo</span>
      </div>
    </header>
  );
}
