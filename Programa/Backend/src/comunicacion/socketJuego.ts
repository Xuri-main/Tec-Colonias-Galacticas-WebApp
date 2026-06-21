/*
    Archivo: socketJuego.ts
    Descripcion: Configura la comunicacion en tiempo real del juego mediante Socket.IO.
    Autores: Emilio Funes R. , Ginger Rodriguez G. & Jareck Levell C.
    Fecha: 21/06/2026
*/

import { Server, Socket } from 'socket.io';
import { ServicioPartidas } from '../servicios/ServicioPartidas';

/*
     configurarSocketJuego
    Entradas: Servidor de Socket.IO y servicio de partidas.
    Salidas: No retorna valor.
    Objetivo: Registrar los eventos principales para sincronizar clientes.
*/
export function configurarSocketJuego(io: Server, servicioPartidas: ServicioPartidas): void {
    servicioPartidas.setAvisarCambio((idPartida: string, estado: object) => {
        io.to(idPartida).emit('partida-actualizada', estado);
    });

    io.on('connection', (socket: Socket) => {
        socket.emit('partidas-actualizadas', servicioPartidas.listarPartidas());

        socket.on('unirse-sala-partidas', () => {
            socket.emit('partidas-actualizadas', servicioPartidas.listarPartidas());
        });

        socket.on('unirse-partida', (datos: any) => {
            try {
                const partida = servicioPartidas.unirJugador(datos.idPartida, socket.id, datos.nickname);
                socket.join(datos.idPartida);
                io.emit('partidas-actualizadas', servicioPartidas.listarPartidas());
                io.to(datos.idPartida).emit('partida-actualizada', partida);
            } catch (error: any) {
                socket.emit('error-juego', { mensaje: error.message });
            }
        });

        socket.on('entrar-partida', (datos: any) => {
            socket.join(datos.idPartida);
        });

        socket.on('iniciar-partida', (datos: any) => {
            try {
                io.to(datos.idPartida).emit('cuenta-regresiva', { segundos: 3 });

                setTimeout(() => {
                    try {
                        const partida = servicioPartidas.iniciarPartida(datos.idPartida);
                        io.emit('partidas-actualizadas', servicioPartidas.listarPartidas());
                        io.to(datos.idPartida).emit('partida-iniciada', partida);
                    } catch (error: any) {
                        io.to(datos.idPartida).emit('error-juego', { mensaje: error.message });
                    }
                }, 3000);
            } catch (error: any) {
                socket.emit('error-juego', { mensaje: error.message });
            }
        });

        socket.on('construir', (datos: any) => {
            try {
                const partida = servicioPartidas.construir(datos.idPartida, datos.jugadorId, datos.sistemaId, datos.tipoConstruccion);
                io.to(datos.idPartida).emit('partida-actualizada', partida);
            } catch (error: any) {
                socket.emit('error-juego', { mensaje: error.message });
            }
        });

        socket.on('mover-flotas', (datos: any) => {
            try {
                const partida = servicioPartidas.moverFlotas(datos.idPartida, datos.jugadorId, datos.origenId, datos.destinoId, Number(datos.cantidad));
                io.to(datos.idPartida).emit('partida-actualizada', partida);
            } catch (error: any) {
                socket.emit('error-juego', { mensaje: error.message });
            }
        });
    });
}
