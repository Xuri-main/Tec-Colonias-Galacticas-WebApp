
export class Jugador {
    private idSocket: string;
    private nickname: string;
    private creditosGalacticos: number;

    constructor(idSocket: string, nickname: string) {
        this.idSocket = idSocket;
        this.nickname = nickname;
        this.creditosGalacticos = 500; // Saldo inicial
    }

    public getNickname(): string {
        return this.nickname;
    }

    public getIdSocket(): string {
        return this.idSocket;
    }

    public getCreditos(): number {
        return this.creditosGalacticos;
    }

    public agregarCreditos(cantidad: number): void {
        if (cantidad > 0) {
            this.creditosGalacticos += cantidad;
        }
    }

    public gastarCreditos(cantidad: number): boolean {
        if (this.creditosGalacticos >= cantidad) {
            this.creditosGalacticos -= cantidad;
            return true;
        }
        return false;
    }
}