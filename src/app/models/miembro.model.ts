export interface Miembro {
    id_miembro: string;
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    nombre_usuario: string;
    email: string;
    telefono: string;
}

export interface MiembroCreate {
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    nombre_usuario: string;
    email: string;
    telefono: string;
    clave: string;
}

export interface MiembroUpdate {
    primer_nombre?: string;
    segundo_nombre?: string;
    primer_apellido?: string;
    segundo_apellido?: string;
    nombre_usuario?: string;
    email?: string;
    telefono?: string;
    clave?: string;
}