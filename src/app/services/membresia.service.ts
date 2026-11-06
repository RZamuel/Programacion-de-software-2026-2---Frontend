import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiLista, ApiUno } from '../models/api-respuesta.model';
import { Membresia, MembresiaCreate, MembresiaUpdate } from '../models/membresia.model';

@Injectable({ providedIn: 'root' })
export class MembresiaService {
    private readonly http = inject(HttpClient);
    private readonly base = `${environment.apiUrl}/membresias`;

    listar(): Observable<ApiLista<Membresia>> {
        return this.http.get<ApiLista<Membresia>>(`${this.base}/`);
    }

    obtener(id: string): Observable<Membresia> {
        return this.http.get<Membresia>(`${this.base}/${id}`);
    }

    crear(datos: MembresiaCreate): Observable<ApiUno<Membresia>> {
        return this.http.post<ApiUno<Membresia>>(`${this.base}/`, datos);
    }

    actualizar(id: string, datos: MembresiaUpdate): Observable<ApiUno<Membresia>> {
        return this.http.put<ApiUno<Membresia>>(`${this.base}/${id}`, datos);
    }

    eliminar(id: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }
}