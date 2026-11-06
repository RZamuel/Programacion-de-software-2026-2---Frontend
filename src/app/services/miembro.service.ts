import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiLista, ApiUno } from '../models/api-respuesta.model';
import { Miembro, MiembroCreate, MiembroUpdate } from '../models/miembro.model';

@Injectable({ providedIn: 'root' })
export class MiembroService {
    private readonly http = inject(HttpClient);
    private readonly base = `${environment.apiUrl}/miembros`;

    listar(): Observable<ApiLista<Miembro>> {
        return this.http.get<ApiLista<Miembro>>(`${this.base}/`);
    }

    obtener(id: string): Observable<Miembro> {
        return this.http.get<Miembro>(`${this.base}/${id}`);
    }

    crear(datos: MiembroCreate): Observable<ApiUno<Miembro>> {
        return this.http.post<ApiUno<Miembro>>(`${this.base}/`, datos);
    }

    actualizar(id: string, datos: MiembroUpdate): Observable<ApiUno<Miembro>> {
        return this.http.put<ApiUno<Miembro>>(`${this.base}/${id}`, datos);
    }

    eliminar(id: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }
}
