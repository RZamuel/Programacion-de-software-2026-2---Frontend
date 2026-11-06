import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiLista, ApiUno } from '../models/api-respuesta.model';
import { Rutina, RutinaCreate, RutinaUpdate } from '../models/rutina.model';

@Injectable({ providedIn: 'root' })
export class RutinaService {
    private readonly http = inject(HttpClient);
    private readonly base = `${environment.apiUrl}/rutinas`;

    listar(): Observable<ApiLista<Rutina>> {
        return this.http.get<ApiLista<Rutina>>(`${this.base}/`);
    }

    obtener(id: string): Observable<Rutina> {
        return this.http.get<Rutina>(`${this.base}/${id}`);
    }

    crear(datos: RutinaCreate): Observable<ApiUno<Rutina>> {
        return this.http.post<ApiUno<Rutina>>(`${this.base}/`, datos);
    }

    actualizar(id: string, datos: RutinaUpdate): Observable<ApiUno<Rutina>> {
        return this.http.put<ApiUno<Rutina>>(`${this.base}/${id}`, datos);
    }

    eliminar(id: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }
}