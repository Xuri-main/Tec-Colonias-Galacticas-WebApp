/*
    Archivo: IconoRecurso.tsx
    Descripcion: Componente pequeno para representar recursos del juego.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { ElementType } from 'react';

interface PropiedadesIconoRecurso {
  icono: ElementType;
  etiqueta: string;
  color: string;
}

/*
     IconoRecurso
    Entradas: Icono, etiqueta y color del recurso.
    Salidas: Retorna un indicador de recurso.
    Objetivo: Reutilizar la representacion visual de minerales, energia y cristales.
*/
export function IconoRecurso({ icono: Icono, etiqueta, color }: PropiedadesIconoRecurso) {
  return (
    <div className="icono-recurso">
      <Icono size={13} style={{ color }} />
      <span>{etiqueta}</span>
    </div>
  );
}
