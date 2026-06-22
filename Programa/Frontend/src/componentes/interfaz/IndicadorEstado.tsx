/*
    Archivo: IndicadorEstado.tsx
    Descripcion: Indicador visual para representar estados activos o inactivos.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

interface PropiedadesIndicadorEstado {
  activo?: boolean;
}

/*
     IndicadorEstado
    Entradas: Estado activo opcional.
    Salidas: Retorna un punto visual de estado.
    Objetivo: Mostrar de forma sencilla si un sistema o servicio esta activo.
*/
export function IndicadorEstado({ activo = true }: PropiedadesIndicadorEstado) {
  return <span className={activo ? 'indicador-estado activo' : 'indicador-estado'} />;
}
