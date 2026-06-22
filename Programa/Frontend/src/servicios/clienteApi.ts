/*
    Archivo: clienteApi.ts
    Descripcion: Cliente sencillo para realizar peticiones HTTP al backend.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/*
     solicitar
    Entradas: Ruta del endpoint y opciones de la peticion.
    Salidas: Respuesta JSON del backend.
    Objetivo: Centralizar las llamadas HTTP para no repetir codigo en las paginas.
*/
export async function solicitar<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(opciones.headers || {})
    },
    ...opciones
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || 'Ocurrio un error al comunicarse con el servidor.');
  }

  return datos as T;
}
