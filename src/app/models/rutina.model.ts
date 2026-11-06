export interface Rutina {
    id_rutina: string;
    id_miembro: string;
    id_entrenador: string;
    nombre: string;
    descripcion: string;
    fecha_creacion: string;
}

export interface RutinaCreate {
    id_miembro: string;
    id_entrenador: string;
    nombre: string;
    descripcion: string;
    fecha_creacion: string;
}

export interface RutinaUpdate {
    id_miembro?: string;
    id_entrenador?: string;
    nombre?: string;
    descripcion?: string;
    fecha_creacion?: string;
}