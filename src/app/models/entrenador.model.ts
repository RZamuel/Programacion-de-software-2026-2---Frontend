export interface Entrenador {
    id_entrenador: string;
    nombre: string;
    apellido: string;
    especialidad: string;
    telefono: string;
    salario: number;
}

export interface EntrenadorCreate {
    nombre: string;
    apellido: string;
    especialidad: string;
    telefono: string;
    salario: number;
}

export interface EntrenadorUpdate {
    nombre?: string;
    apellido?: string;
    especialidad?: string;
    telefono?: string;
    salario?: number;
}