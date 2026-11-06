import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Clase, ClaseCreate, ClaseUpdate } from '../../models/clase.model';
import { ClaseService } from '../../services/clase.service';

type ModoPopup = 'crear' | 'editar';

@Component({
  selector: 'app-clases',
  imports: [CommonModule, FormsModule],
  templateUrl: './clases.html',
  styleUrl: './clases.css',
})
export class Clases implements OnInit {
  private readonly claseService = inject(ClaseService);

  readonly filas = signal<Clase[]>([]);
  readonly mensaje = signal('');
  readonly esError = signal(false);
  readonly cargando = signal(false);
  readonly popupAbierto = signal(false);
  readonly modo = signal<ModoPopup>('crear');

  idFiltro = '';
  formulario: ClaseCreate = this.formularioVacio();
  private idEditando = '';

  ngOnInit(): void { this.cargarTodos(); }

  buscarPorId(): void {
    const id = this.idFiltro.trim();
    if (!id) { this.cargarTodos(); return; }
    this.cargando.set(true);
    this.claseService.obtener(id).subscribe({
      next: (clase) => { this.filas.set([clase]); this.avisar(''); this.cargando.set(false); },
      error: (error: HttpErrorResponse) => { this.filas.set([]); this.avisar(this.textoError(error, false), true); this.cargando.set(false); },
    });
  }

  limpiarFiltro(): void { this.idFiltro = ''; this.cargarTodos(); }

  abrirCrear(): void {
    this.modo.set('crear'); this.idEditando = '';
    this.formulario = this.formularioVacio(); this.popupAbierto.set(true);
  }

  abrirEditar(fila: Clase): void {
    this.modo.set('editar'); this.idEditando = fila.id_clase;
    this.formulario = {
      id_entrenador: fila.id_entrenador,
      nombre: fila.nombre,
      dia_semana: fila.dia_semana,
      hora: fila.hora,
      capacidad_maxima: fila.capacidad_maxima
    };
    this.popupAbierto.set(true);
  }

  cerrarPopup(): void { this.popupAbierto.set(false); }

  guardar(): void {
    if (!this.formularioValido()) {
      this.avisar('Completa el ID del entrenador, nombre, día, hora y capacidad.', true);
      return;
    }
    this.cargando.set(true);
    if (this.modo() === 'crear') {
      this.claseService.crear(this.formulario).subscribe({
        next: () => this.despuesDeGuardar('Clase creada'),
        error: (error: HttpErrorResponse) => this.falloGuardar(error),
      });
    } else {
      this.claseService.actualizar(this.idEditando, this.datosEdicion()).subscribe({
        next: () => this.despuesDeGuardar('Clase actualizada'),
        error: (error: HttpErrorResponse) => this.falloGuardar(error),
      });
    }
  }

  eliminar(fila: Clase): void {
    if (!confirm(`¿Eliminar la clase ${fila.nombre}?`)) return;
    this.cargando.set(true);
    this.claseService.eliminar(fila.id_clase).subscribe({
      next: () => { this.avisar('Clase eliminada'); this.refrescar(); },
      error: (error: HttpErrorResponse) => { this.avisar(this.textoError(error, false), true); this.cargando.set(false); },
    });
  }

  private cargarTodos(): void {
    this.cargando.set(true);
    this.claseService.listar().subscribe({
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
      d.id_entrenador.trim() &&
      d.nombre.trim() &&
      d.dia_semana.trim() &&
      d.hora.trim() &&
      d.capacidad_maxima > 0
    );
  }

  private datosEdicion(): ClaseUpdate {
    return {
      id_entrenador: this.formulario.id_entrenador.trim(),
      nombre: this.formulario.nombre.trim(),
      dia_semana: this.formulario.dia_semana.trim(),
      hora: this.formulario.hora.trim(),
      capacidad_maxima: this.formulario.capacidad_maxima
    };
  }

  private formularioVacio(): ClaseCreate {
    return {
      id_entrenador: '',
      nombre: '',
      dia_semana: 'Lunes',
      hora: '08:00',
      capacidad_maxima: 10
    };
  }

  private avisar(texto: string, error = false): void {
    this.mensaje.set(texto);
    this.esError.set(error && texto.length > 0);
  }

  private textoError(error: HttpErrorResponse, alListar: boolean): string {
    if (error.status === 0) return 'No se pudo conectar con la API. Revisa que el backend esté en el puerto 8000.';
    if (error.status === 404) return alListar ? 'No hay registros' : 'No encontrado';
    if (error.status === 409) return 'Esa clase ya existe';
    if (error.status === 422) return 'Revisa los datos. El ID del entrenador tiene que ser un UUID válido.';
    const detail = error.error?.detail;
    if (typeof detail === 'string') return detail;
    return 'No se pudo completar la operación';
  }
}