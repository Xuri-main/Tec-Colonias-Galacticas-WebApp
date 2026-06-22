/*
    Archivo: FondoGalactico.tsx
    Descripcion: Agrupa las capas visuales usadas como fondo general.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { EfectoEstrellas } from './EfectoEstrellas';
import { MallaTactica } from './MallaTactica';
import { Nebulosas } from './Nebulosas';
import { LineaEscaneo } from './LineaEscaneo';

/*
     FondoGalactico
    Entradas: No recibe entradas.
    Salidas: Retorna todas las capas decorativas de fondo.
    Objetivo: Mantener el fondo separado de las paginas y componentes funcionales.
*/
export function FondoGalactico() {
  return (
    <div className="fondo-galactico">
      <EfectoEstrellas />
      <MallaTactica />
      <Nebulosas />
      <LineaEscaneo />
    </div>
  );
}
