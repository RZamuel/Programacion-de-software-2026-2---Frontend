import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ReservaClase, ReservaClaseCreate, ReservaClaseUpdate } from '../../models/reserva-clase.model';
import { ReservaClaseService } from '../../services/reserva-clase.service';

type ModoPopup = 'crear' | 'editar';

@Component({
  selector: 'app-reservas',
  imports: [CommonModule, FormsModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css',
})
export class Reservas implements OnInit {
  private readonly reservaService = inject(ReservaClaseService);

  readonly filas = signal<ReservaClase[]>([]);
  readonly mensaje = signal('');
  readonly esError = signal(false);
  readonly cargando = signal(false);
  readonly popupAbierto = signal(false);
  readonly modo = signal<ModoPopup>('crear');

  idFiltro = '';
  formulario: ReservaClaseCreate = this.formularioVacio();
  private idEditando = '';

  ngOnInit(): void { this.cargarTodos(); }

  buscarPorId(): void {
    const id = this.idFiltro.trim();
    if (!id) { this.cargarTodos(); return; }
    this.cargando.set(true);
    this.reservaService.obtener(id).subscribe({
      next: (reserva) => { this.filas.set([reserva]); this.avisar(''); this.cargando.set(false); },
      error: (error: HttpErrorResponse) => { this.filas.set([]); this.avisar(this.textoError(error, false), true); this.cargando.set(false); },
    });
  }

  limpiarFiltro(): void { this.idFiltro = ''; this.cargarTodos(); }

  abrirCrear(): void {
    this.modo.set('crear'); this.idEditando = '';
    this.formulario = this.formularioVacio(); this.popupAbierto.set(true);
  }

  abrirEditar(fila: ReservaClase): void {
    this.modo.set('editar'); this.idEditando = fila.id_reserva;
    this.formulario = {
      id_miembro: fila.id_miembro,
      id_clase: fila.id_clase,
      fecha_reserva: fila.fecha_reserva,
      estado: fila.estado
    };
    this.popupAbierto.set(true);
  }

  cerrarPopup(): void { this.popupAbierto.set(false); }

  guardar(): void {
    if (!this.formularioValido()) {
      this.avisar('Completa los dos ID, la fecha y el estado.', true);
      return;
    }
    this.cargando.set(true);
    if (this.modo() === 'crear') {
      this.reservaService.crear(this.formulario).subscribe({
        next: () => this.despuesDeGuardar('Reserva creada'),
        error: (error: HttpErrorResponse) => this.falloGuardar(error),
      });
    } else {
      this.reservaService.actualizar(this.idEditando, this.datosEdicion()).subscribe({
        next: () => this.despuesDeGuardar('Reserva actualizada'),
        error: (error: HttpErrorResponse) => this.falloGuardar(error),
      });
    }
  }

  eliminar(fila: ReservaClase): void {
    if (!confirm('¿Eliminar esta reserva?')) return;
    this.cargando.set(true);
    this.reservaService.eliminar(fila.id_reserva).subscribe({
      next: () => { this.avisar('Reserva eliminada'); this.refrescar(); },
      error: (error: HttpErrorResponse) => { this.avisar(this.textoError(error, false), true); this.cargando.set(false); },
    });
  }

  private cargarTodos(): void {
    this.cargando.set(true);
    this.reservaService.listar().subscribe({
      next: (respuesta) => {
        const filas = respuesta.data ?? [];
        this.filas.set(filas);
        this.avisar(filas.length ? '' : 'No hay registros');
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.filas.set([]);
        const listaVacia = error.status === 404;
        this.avisar(listaVacia ? 'No hay registros' : this.textoError(error, true), !listaVacia);
        this.cargando.set(false);
      },
    });
  }

  private refrescar(): void {
    if (this.idFiltro.trim()) { this.buscarPorId(); return; }
    this.cargarTodos();
  }

  private despuesDeGuardar(texto: string): void {
    this.popupAbierto.set(false);
    this.avisar(texto);
    this.refrescar();
  }

  private falloGuardar(error: HttpErrorResponse): void {
    this.avisar(this.textoError(error, false), true);
    this.cargando.set(false);
  }

  private formularioValido(): boolean {
    const d = this.formulario;
    return Boolean(
      d.id_miembro.trim() &&
      d.id_clase.trim() &&
      d.fecha_reserva &&
      d.estado.trim()
    );
  }

  private datosEdicion(): ReservaClaseUpdate {
    return {
      id_miembro: this.formulario.id_miembro.trim(),
      id_clase: this.formulario.id_clase.trim(),
      fecha_reserva: this.formulario.fecha_reserva,
      estado: this.formulario.estado.trim()
    };
  }

  private formularioVacio(): ReservaClaseCreate {
    return {
      id_miembro: '',
      id_clase: '',
      fecha_reserva: new Date().toISOString().split('T')[0],
      estado: 'confirmada'
    };
  }

  private avisar(texto: string, error = false): void {
    this.mensaje.set(texto);
    this.esError.set(error && texto.length > 0);
  }

  private textoError(error: HttpErrorResponse, alListar: boolean): string {
    if (error.status === 0) return 'No se pudo conectar con la API. Revisa que el backend esté en el puerto 8000.';
    if (error.status === 404) return alListar ? 'No hay registros' : 'No encontrado';
    if (error.status === 409) return 'Esa reserva ya existe';
    if (error.status === 422) return 'Revisa los datos. Los ID tienen que ser UUID válidos.';
    const detail = error.error?.detail;
    if (typeof detail === 'string') return detail;
    return 'No se pudo completar la operación';
  }
}