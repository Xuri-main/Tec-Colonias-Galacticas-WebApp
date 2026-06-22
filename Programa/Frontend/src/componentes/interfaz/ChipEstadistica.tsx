/*
    Archivo: ChipEstadistica.tsx
    Descripcion: Componente para mostrar datos breves de la galaxia o del sistema.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

interface PropiedadesChipEstadistica {
  valor: string;
  etiqueta: string;
}

/*
     ChipEstadistica
    Entradas: Valor y etiqueta de la estadistica.
    Salidas: Retorna un bloque pequeno de estadistica.
    Objetivo: Presentar datos importantes sin sobrecargar la pantalla.
*/
export function ChipEstadistica({ valor, etiqueta }: PropiedadesChipEstadistica) {
  return (
    <div className="chip-estadistica">
      <span className="chip-estadistica-valor">{valor}</span>
      <span className="chip-estadistica-etiqueta">{etiqueta}</span>
    </div>
  );
}
