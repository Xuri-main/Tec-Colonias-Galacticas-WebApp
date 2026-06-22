/*
    Archivo: main.tsx
    Descripcion: Punto de entrada de la aplicacion React.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './estilos/global.css';

/*
     renderizarAplicacion
    Entradas: No recibe entradas.
    Salidas: Renderiza la aplicacion en el navegador.
    Objetivo: Cargar el componente principal App dentro del elemento root.
*/
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
