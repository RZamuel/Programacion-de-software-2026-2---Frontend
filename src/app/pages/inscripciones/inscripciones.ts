import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Inscripcion, InscripcionCreate, InscripcionUpdate } from '../../models/inscripcion.model';
import { InscripcionService } from '../../services/inscripcion.service';

type ModoPopup = 'crear' | 'editar';

@Component({
  selector: 'app-inscripciones',
  imports: [CommonModule, FormsModule],
  templateUrl: './inscripciones.html',
  styleUrl: './inscripciones.css',
})
export class Inscripciones implements OnInit {
  private readonly inscripcionService = inject(InscripcionService);

  readonly filas = signal<Inscripcion[]>([]);
  readonly mensaje = signal('');
  readonly esError = signal(false);
  readonly cargando = signal(false);
  readonly popupAbierto = signal(false);
  readonly modo = signal<ModoPopup>('crear');

  idFiltro = '';
  formulario: InscripcionCreate = this.formularioVacio();
  private idEditando = '';

  ngOnInit(): void { this.cargarTodos(); }

  buscarPorId(): void {
    const id = this.idFiltro.trim();
    if (!id) { this.cargarTodos(); return; }
    this.cargando.set(true);
    this.inscripcionService.obtener(id).subscribe({
      next: (inscripcion) => { this.filas.set([inscripcion]); this.avisar(''); this.cargando.set(false); },
      error: (error: HttpErrorResponse) => { this.filas.set([]); this.avisar(this.textoError(error, false), true); this.cargando.set(false); },
    });
  }

  limpiarFiltro(): void { this.idFiltro = ''; this.cargarTodos(); }

  abrirCrear(): void {
    this.modo.set('crear'); this.idEditando = '';
    this.formulario = this.formularioVacio(); this.popupAbierto.set(true);
  }

  abrirEditar(fila: Inscripcion): void {
    this.modo.set('editar'); this.idEditando = fila.id_inscripcion;
    this.formulario = {
      id_miembro: fila.id_miembro,
      id_membresia: fila.id_membresia,
      fecha_inicio: fila.fecha_inicio,
      fecha_fin: fila.fecha_fin,
      estado: fila.estado
    };
    this.popupAbierto.set(true);
  }

  cerrarPopup(): void { this.popupAbierto.set(false); }

  guardar(): void {
    if (!this.formularioValido()) {
      this.avisar('Completa los dos ID, las fechas y el estado.', true);
      return;
    }
    this.cargando.set(true);
    if (this.modo() === 'crear') {
      this.inscripcionService.crear(this.formulario).subscribe({
        next: () => this.despuesDeGuardar('Inscripción creada'),
        error: (error: HttpErrorResponse) => this.falloGuardar(error),
      });
    } else {
      this.inscripcionService.actualizar(this.idEditando, this.datosEdicion()).subscribe({
        next: () => this.despuesDeGuardar('Inscripción actualizada'),
        error: (error: HttpErrorResponse) => this.falloGuardar(error),
      });
    }
  }

  eliminar(fila: Inscripcion): void {
    if (!confirm('¿Eliminar esta inscripción?')) return;
    this.cargando.set(true);
    this.inscripcionService.eliminar(fila.id_inscripcion).subscribe({
      next: () => { this.avisar('Inscripción eliminada'); this.refrescar(); },
      error: (error: HttpErrorResponse) => { this.avisar(this.textoError(error, false), true); this.cargando.set(false); },
    });
  }

  private cargarTodos(): void {
    this.cargando.set(true);
    this.inscripcionService.listar().subscribe({
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
      d.id_membresia.trim() &&
      d.fecha_inicio &&
      d.fecha_fin &&
      d.estado.trim()
    );
  }

  private datosEdicion(): InscripcionUpdate {
    return {
      id_miembro: this.formulario.id_miembro.trim(),
      id_membresia: this.formulario.id_membresia.trim(),
      fecha_inicio: this.formulario.fecha_inicio,
      fecha_fin: this.formulario.fecha_fin,
      estado: this.formulario.estado.trim()
    };
  }

  private formularioVacio(): InscripcionCreate {
    return {
      id_miembro: '',
      id_membresia: '',
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: '',
      estado: 'activa'
    };
  }

  private avisar(texto: string, error = false): void {
    this.mensaje.set(texto);
    this.esError.set(error && texto.length > 0);
  }

  private textoError(error: HttpErrorResponse, alListar: boolean): string {
    if (error.status === 0) return 'No se pudo conectar con la API. Revisa que el backend esté en el puerto 8000.';
    if (error.status === 404) return alListar ? 'No hay registros' : 'No encontrado';
    if (error.status === 409) return 'Ese registro ya existe';
    if (error.status === 422) return 'Revisa los datos. Los ID tienen que ser UUID válidos y las fechas formato AAAA-MM-DD.';
    const detail = error.error?.detail;
    if (typeof detail === 'string') return detail;
    return 'No se pudo completar la operación';
  }
}