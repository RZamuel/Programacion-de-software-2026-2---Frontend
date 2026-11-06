import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiLista, ApiUno } from '../models/api-respuesta.model';
import { ReservaClase, ReservaClaseCreate, ReservaClaseUpdate } from '../models/reserva-clase.model';

@Injectable({ providedIn: 'root' })
export class ReservaClaseService {
    private readonly http = inject(HttpClient);
    private readonly base = `${environment.apiUrl}/reservas`;

    listar(): Observable<ApiLista<ReservaClase>> {
        return this.http.get<ApiLista<ReservaClase>>(`${this.base}/`);
    }

    obtener(id: string): Observable<ReservaClase> {
        return this.http.get<ReservaClase>(`${this.base}/${id}`);
    }

    crear(datos: ReservaClaseCreate): Observable<ApiUno<ReservaClase>> {
        return this.http.post<ApiUno<ReservaClase>>(`${this.base}/`, datos);
    }

    actualizar(id: string, datos: ReservaClaseUpdate): Observable<ApiUno<ReservaClase>> {
        return this.http.put<ApiUno<ReservaClase>>(`${this.base}/${id}`, datos);
    }

    eliminar(id: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }
}