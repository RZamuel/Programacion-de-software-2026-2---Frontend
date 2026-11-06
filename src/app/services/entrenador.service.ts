import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiLista, ApiUno } from '../models/api-respuesta.model';
import { Entrenador, EntrenadorCreate, EntrenadorUpdate } from '../models/entrenador.model';

@Injectable({ providedIn: 'root' })
export class EntrenadorService {
    private readonly http = inject(HttpClient);
    private readonly base = `${environment.apiUrl}/entrenadores`;

    listar(): Observable<ApiLista<Entrenador>> {
        return this.http.get<ApiLista<Entrenador>>(`${this.base}/`);
    }

    obtener(id: string): Observable<Entrenador> {
        return this.http.get<Entrenador>(`${this.base}/${id}`);
    }

    crear(datos: EntrenadorCreate): Observable<ApiUno<Entrenador>> {
        return this.http.post<ApiUno<Entrenador>>(`${this.base}/`, datos);
    }

    actualizar(id: string, datos: EntrenadorUpdate): Observable<ApiUno<Entrenador>> {
        return this.http.put<ApiUno<Entrenador>>(`${this.base}/${id}`, datos);
    }

    eliminar(id: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }
}