/*
    Archivo: TarjetaAccion.tsx
    Descripcion: Tarjeta reutilizable para acciones principales del menu.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { ElementType, useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface PropiedadesTarjetaAccion {
  icono: ElementType;
  titulo: string;
  descripcion: string;
  color: 'cyan' | 'magenta' | 'ambar';
  deshabilitada: boolean;
  alPresionar: () => void;
}

/*
     TarjetaAccion
    Entradas: Icono, texto, color, estado y evento de presionado.
    Salidas: Retorna una tarjeta interactiva.
    Objetivo: Unificar el estilo de las opciones Crear Partida, Unirse y Ranking.
*/
export function TarjetaAccion({
  icono: Icono,
  titulo,
  descripcion,
  color,
  deshabilitada,
  alPresionar
}: PropiedadesTarjetaAccion) {
  const [encima, setEncima] = useState(false);

  return (
    <button
      className={`tarjeta-accion ${color} ${encima ? 'encima' : ''}`}
      disabled={deshabilitada}
      onClick={alPresionar}
      onMouseEnter={() => setEncima(true)}
      onMouseLeave={() => setEncima(false)}
    >
      <span className="esquina superior-izquierda" />
      <span className="esquina inferior-derecha" />
      <div className="tarjeta-accion-icono">
        <Icono size={18} />
      </div>
      <div className="tarjeta-accion-texto">
        <div className="tarjeta-accion-encabezado">
          <span>{titulo}</span>
          <ChevronRight size={14} />
        </div>
        <p>{descripcion}</p>
      </div>
    </button>
  );
}
