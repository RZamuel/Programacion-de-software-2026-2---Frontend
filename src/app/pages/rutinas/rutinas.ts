import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Rutina, RutinaCreate, RutinaUpdate } from '../../models/rutina.model';
import { RutinaService } from '../../services/rutina.service';

type ModoPopup = 'crear' | 'editar';

@Component({
  selector: 'app-rutinas',
  imports: [CommonModule, FormsModule],
  templateUrl: './rutinas.html',
  styleUrl: './rutinas.css',
})
export class Rutinas implements OnInit {
  private readonly rutinaService = inject(RutinaService);

  readonly filas = signal<Rutina[]>([]);
  readonly mensaje = signal('');
  readonly esError = signal(false);
  readonly cargando = signal(false);
  readonly popupAbierto = signal(false);
  readonly modo = signal<ModoPopup>('crear');

  idFiltro = '';
  formulario: RutinaCreate = this.formularioVacio();
  private idEditando = '';

  ngOnInit(): void { this.cargarTodos(); }

  buscarPorId(): void {
    const id = this.idFiltro.trim();
    if (!id) { this.cargarTodos(); return; }
    this.cargando.set(true);
    this.rutinaService.obtener(id).subscribe({
      next: (rutina) => { this.filas.set([rutina]); this.avisar(''); this.cargando.set(false); },
      error: (error: HttpErrorResponse) => { this.filas.set([]); this.avisar(this.textoError(error, false), true); this.cargando.set(false); },
    });
  }

  limpiarFiltro(): void { this.idFiltro = ''; this.cargarTodos(); }

  abrirCrear(): void {
    this.modo.set('crear'); this.idEditando = '';
    this.formulario = this.formularioVacio(); this.popupAbierto.set(true);
  }

  abrirEditar(fila: Rutina): void {
    this.modo.set('editar'); this.idEditando = fila.id_rutina;
    this.formulario = {
      id_miembro: fila.id_miembro,
      id_entrenador: fila.id_entrenador,
      nombre: fila.nombre,
      descripcion: fila.descripcion,
      fecha_creacion: fila.fecha_creacion
    };
    this.popupAbierto.set(true);
  }

  cerrarPopup(): void { this.popupAbierto.set(false); }

  guardar(): void {
    if (!this.formularioValido()) {
      this.avisar('Completa los dos ID, el nombre y la descripción.', true);
      return;
    }
    this.cargando.set(true);
    if (this.modo() === 'crear') {
      this.rutinaService.crear(this.formulario).subscribe({
        next: () => this.despuesDeGuardar('Rutina creada'),
        error: (error: HttpErrorResponse) => this.falloGuardar(error),
      });
    } else {
      this.rutinaService.actualizar(this.idEditando, this.datosEdicion()).subscribe({
        next: () => this.despuesDeGuardar('Rutina actualizada'),
        error: (error: HttpErrorResponse) => this.falloGuardar(error),
      });
    }
  }

  eliminar(fila: Rutina): void {
    if (!confirm(`¿Eliminar la rutina "${fila.nombre}"?`)) return;
    this.cargando.set(true);
    this.rutinaService.eliminar(fila.id_rutina).subscribe({
      next: () => { this.avisar('Rutina eliminada'); this.refrescar(); },
      error: (error: HttpErrorResponse) => { this.avisar(this.textoError(error, false), true); this.cargando.set(false); },
    });
  }

  private cargarTodos(): void {
    this.cargando.set(true);
    this.rutinaService.listar().subscribe({
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
      d.id_entrenador.trim() &&
      d.nombre.trim() &&
      d.descripcion.trim() &&
      d.fecha_creacion
    );
  }

  private datosEdicion(): RutinaUpdate {
    return {
      id_miembro: this.formulario.id_miembro.trim(),
      id_entrenador: this.formulario.id_entrenador.trim(),
      nombre: this.formulario.nombre.trim(),
      descripcion: this.formulario.descripcion.trim(),
      fecha_creacion: this.formulario.fecha_creacion
    };
  }

  private formularioVacio(): RutinaCreate {
    return {
      id_miembro: '',
      id_entrenador: '',
      nombre: '',
      descripcion: '',
      fecha_creacion: new Date().toISOString().split('T')[0]
    };
  }

  private avisar(texto: string, error = false): void {
    this.mensaje.set(texto);
    this.esError.set(error && texto.length > 0);
  }

  private textoError(error: HttpErrorResponse, alListar: boolean): string {
    if (error.status === 0) return 'No se pudo conectar con la API. Revisa que el backend esté en el puerto 8000.';
    if (error.status === 404) return alListar ? 'No hay registros' : 'No encontrado';
    if (error.status === 409) return 'Esa rutina ya existe';
    if (error.status === 422) return 'Revisa los datos. Los ID tienen que ser UUID válidos.';
    const detail = error.error?.detail;
    if (typeof detail === 'string') return detail;
    return 'No se pudo completar la operación';
  }
}