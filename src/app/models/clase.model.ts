export interface Clase {
    id_clase: string;
    id_entrenador: string;
    nombre: string;
    dia_semana: string;
    hora: string;
    capacidad_maxima: number;
}

export interface ClaseCreate {
    id_entrenador: string;
    nombre: string;
    dia_semana: string;
    hora: string;
    capacidad_maxima: number;
}

export interface ClaseUpdate {
    id_entrenador?: string;
    nombre?: string;
    dia_semana?: string;
    hora?: string;
    capacidad_maxima?: number;
}