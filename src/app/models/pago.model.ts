export interface Pago {
    id_pago: string;
    id_miembro: string;
    monto: number;
    fecha_pago: string;
    metodo_pago: string;
    concepto: string;
}

export interface PagoCreate {
    id_miembro: string;
    monto: number;
    fecha_pago: string;
    metodo_pago: string;
    concepto: string;
}

export interface PagoUpdate {
    id_miembro?: string;
    monto?: number;
    fecha_pago?: string;
    metodo_pago?: string;
    concepto?: string;
}