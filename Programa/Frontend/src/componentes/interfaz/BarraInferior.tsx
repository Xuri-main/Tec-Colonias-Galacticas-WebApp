/*
    Archivo: BarraInferior.tsx
    Descripcion: Barra inferior informativa de la aplicacion.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

/*
     BarraInferior
    Entradas: No recibe entradas.
    Salidas: Retorna la barra inferior.
    Objetivo: Cerrar visualmente la pantalla y mostrar informacion del proyecto.
*/
export function BarraInferior() {
  return (
    <footer className="barra-inferior">
      <span>Proyecto Programado #4 — Colonias Galacticas</span>
      <div>
        <span>React</span>
        <span>Vite</span>
        <span>Socket.IO</span>
      </div>
    </footer>
  );
}
