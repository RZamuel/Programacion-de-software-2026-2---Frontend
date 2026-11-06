import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiLista, ApiUno } from '../models/api-respuesta.model';
import { Pago, PagoCreate, PagoUpdate } from '../models/pago.model';

@Injectable({ providedIn: 'root' })
export class PagoService {
    private readonly http = inject(HttpClient);
    private readonly base = `${environment.apiUrl}/pagos`;

    listar(): Observable<ApiLista<Pago>> {
        return this.http.get<ApiLista<Pago>>(`${this.base}/`);
    }

    obtener(id: string): Observable<Pago> {
        return this.http.get<Pago>(`${this.base}/${id}`);
    }

    crear(datos: PagoCreate): Observable<ApiUno<Pago>> {
        return this.http.post<ApiUno<Pago>>(`${this.base}/`, datos);
    }

    actualizar(id: string, datos: PagoUpdate): Observable<ApiUno<Pago>> {
        return this.http.put<ApiUno<Pago>>(`${this.base}/${id}`, datos);
    }

    eliminar(id: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }
}