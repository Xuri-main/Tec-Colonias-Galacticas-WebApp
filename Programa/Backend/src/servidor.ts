/*
    Archivo: servidor.ts
    Descripcion: Punto de entrada del backend y configuracion del servidor HTTP con Socket.IO.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import aplicacion, { obtenerServicioPartidas } from './aplicacion';
import { configurarSocketJuego } from './comunicacion/socketJuego';
import { configuracionJuego } from './configuracion/configuracionJuego';

dotenv.config();

const servidorHttp = http.createServer(aplicacion);
const io = new Server(servidorHttp, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

configurarSocketJuego(io, obtenerServicioPartidas());

servidorHttp.listen(configuracionJuego.puerto, () => {
    console.log(`Servidor backend ejecutandose en http://localhost:${configuracionJuego.puerto}`);
});
