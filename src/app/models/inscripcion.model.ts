export interface Inscripcion {
    id_inscripcion: string;
    id_miembro: string;
    id_membresia: string;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
}

export interface InscripcionCreate {
    id_miembro: string;
    id_membresia: string;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
}

export interface InscripcionUpdate {
    id_miembro?: string;
    id_membresia?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    estado?: string;
}