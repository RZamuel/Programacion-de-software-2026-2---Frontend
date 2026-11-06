import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiLista, ApiUno } from '../models/api-respuesta.model';
import { Inscripcion, InscripcionCreate, InscripcionUpdate } from '../models/inscripcion.model';

@Injectable({ providedIn: 'root' })
export class InscripcionService {
    private readonly http = inject(HttpClient);
    private readonly base = `${environment.apiUrl}/inscripciones`;

    listar(): Observable<ApiLista<Inscripcion>> {
        return this.http.get<ApiLista<Inscripcion>>(`${this.base}/`);
    }

    obtener(id: string): Observable<Inscripcion> {
        return this.http.get<Inscripcion>(`${this.base}/${id}`);
    }

    crear(datos: InscripcionCreate): Observable<ApiUno<Inscripcion>> {
        return this.http.post<ApiUno<Inscripcion>>(`${this.base}/`, datos);
    }

    actualizar(id: string, datos: InscripcionUpdate): Observable<ApiUno<Inscripcion>> {
        return this.http.put<ApiUno<Inscripcion>>(`${this.base}/${id}`, datos);
    }

    eliminar(id: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }
}