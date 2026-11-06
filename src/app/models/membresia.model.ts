export interface Membresia {
    id_membresia: string;
    tipo: string;
    precio: number;
    duracion_dias: number;
    fecha_inicio: string;
    estado: string;
}

export interface MembresiaCreate {
    tipo: string;
    precio: number;
    duracion_dias: number;
    fecha_inicio: string;
    estado: string;
}

export interface MembresiaUpdate {
    tipo?: string;
    precio?: number;
    duracion_dias?: number;
    fecha_inicio?: string;
    estado?: string;
}