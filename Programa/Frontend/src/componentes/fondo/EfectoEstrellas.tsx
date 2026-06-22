/*
    Archivo: EfectoEstrellas.tsx
    Descripcion: Fondo animado de estrellas usando canvas.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { useEffect, useRef } from 'react';

interface Estrella {
  x: number;
  y: number;
  radio: number;
  velocidad: number;
  opacidad: number;
  parpadeo: number;
}

/*
     EfectoEstrellas
    Entradas: No recibe entradas.
    Salidas: Retorna un canvas con estrellas animadas.
    Objetivo: Crear una ambientacion espacial sin depender de imagenes externas.
*/
export function EfectoEstrellas() {
  const referenciaCanvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = referenciaCanvas.current;
    if (!canvas) return;

    const contexto = canvas.getContext('2d');
    if (!contexto) return;

    let idAnimacion = 0;

    const ajustarTamano = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    ajustarTamano();
    window.addEventListener('resize', ajustarTamano);

    const estrellas: Estrella[] = Array.from({ length: 180 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radio: Math.random() * 1.4 + 0.2,
      velocidad: Math.random() * 0.12 + 0.02,
      opacidad: Math.random() * 0.7 + 0.2,
      parpadeo: Math.random() * Math.PI * 2
    }));

    const dibujar = () => {
      contexto.clearRect(0, 0, canvas.width, canvas.height);
      const tiempo = Date.now() / 1000;

      estrellas.forEach((estrella) => {
        const brillo = 0.6 + 0.4 * Math.sin(tiempo * 1.2 + estrella.parpadeo);
        contexto.beginPath();
        contexto.arc(estrella.x, estrella.y, estrella.radio, 0, Math.PI * 2);
        contexto.fillStyle = `rgba(234, 242, 255, ${estrella.opacidad * brillo})`;
        contexto.fill();

        estrella.y += estrella.velocidad;

        if (estrella.y > canvas.height) {
          estrella.y = 0;
          estrella.x = Math.random() * canvas.width;
        }
      });

      idAnimacion = requestAnimationFrame(dibujar);
    };

    dibujar();

    return () => {
      cancelAnimationFrame(idAnimacion);
      window.removeEventListener('resize', ajustarTamano);
    };
  }, []);

  return <canvas ref={referenciaCanvas} className="fondo-estrellas" />;
}
