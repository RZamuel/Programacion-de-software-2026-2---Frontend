import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiLista, ApiUno } from '../models/api-respuesta.model';
import { Clase, ClaseCreate, ClaseUpdate } from '../models/clase.model';

@Injectable({ providedIn: 'root' })
export class ClaseService {
    private readonly http = inject(HttpClient);
    private readonly base = `${environment.apiUrl}/clases`;

    listar(): Observable<ApiLista<Clase>> {
        return this.http.get<ApiLista<Clase>>(`${this.base}/`);
    }

    obtener(id: string): Observable<Clase> {
        return this.http.get<Clase>(`${this.base}/${id}`);
    }

    crear(datos: ClaseCreate): Observable<ApiUno<Clase>> {
        return this.http.post<ApiUno<Clase>>(`${this.base}/`, datos);
    }

    actualizar(id: string, datos: ClaseUpdate): Observable<ApiUno<Clase>> {
        return this.http.put<ApiUno<Clase>>(`${this.base}/${id}`, datos);
    }

    eliminar(id: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }
}