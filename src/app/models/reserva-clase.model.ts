export interface ReservaClase {
    id_reserva: string;
    id_miembro: string;
    id_clase: string;
    fecha_reserva: string;
    estado: string;
}

export interface ReservaClaseCreate {
    id_miembro: string;
    id_clase: string;
    fecha_reserva: string;
    estado: string;
}

export interface ReservaClaseUpdate {
    id_miembro?: string;
    id_clase?: string;
    fecha_reserva?: string;
    estado?: string;
}