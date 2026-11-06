import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // <-- IMPORTANTE para los pipes
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Entrenador, EntrenadorCreate, EntrenadorUpdate } from '../../models/entrenador.model';
import { EntrenadorService } from '../../services/entrenador.service';

type ModoPopup = 'crear' | 'editar';

@Component({
  selector: 'app-entrenadores',
  imports: [CommonModule, FormsModule], // <-- CommonModule agregado aquí
  templateUrl: './entrenadores.html',
  styleUrl: './entrenadores.css',
})
export class Entrenadores implements OnInit {
  private readonly entrenadorService = inject(EntrenadorService);

  readonly filas = signal<Entrenador[]>([]);
  readonly mensaje = signal('');
  readonly esError = signal(false);
  readonly cargando = signal(false);
  readonly popupAbierto = signal(false);
  readonly modo = signal<ModoPopup>('crear');

  idFiltro = '';
  formulario: EntrenadorCreate = this.formularioVacio();
  private idEditando = '';

  ngOnInit(): void { this.cargarTodos(); }

  buscarPorId(): void {
    const id = this.idFiltro.trim();
    if (!id) { this.cargarTodos(); return; }
    this.cargando.set(true);
    this.entrenadorService.obtener(id).subscribe({
      next: (entrenador) => { this.filas.set([entrenador]); this.avisar(''); this.cargando.set(false); },
      error: (error: HttpErrorResponse) => { this.filas.set([]); this.avisar(this.textoError(error, false), true); this.cargando.set(false); },
    });
  }

  limpiarFiltro(): void { this.idFiltro = ''; this.cargarTodos(); }

  abrirCrear(): void {
    this.modo.set('crear'); this.idEditando = '';
    this.formulario = this.formularioVacio(); this.popupAbierto.set(true);
  }

  abrirEditar(fila: Entrenador): void {
    this.modo.set('editar'); this.idEditando = fila.id_entrenador;
    this.formulario = {
      nombre: fila.nombre,
      apellido: fila.apellido,
      especialidad: fila.especialidad,
      telefono: fila.telefono,
      salario: fila.salario
    };
    this.popupAbierto.set(true);
  }

  cerrarPopup(): void { this.popupAbierto.set(false); }

  guardar(): void {
    if (!this.formularioValido()) {
      this.avisar('Completa nombre, apellido, especialidad y salario.', true);
      return;
    }
    this.cargando.set(true);
    if (this.modo() === 'crear') {
      this.entrenadorService.crear(this.formulario).subscribe({
        next: () => this.despuesDeGuardar('Entrenador creado'),
        error: (error: HttpErrorResponse) => this.falloGuardar(error),
      });
    } else {
      this.entrenadorService.actualizar(this.idEditando, this.datosEdicion()).subscribe({
        next: () => this.despuesDeGuardar('Entrenador actualizado'),
        error: (error: HttpErrorResponse) => this.falloGuardar(error),
      });
    }
  }

  eliminar(fila: Entrenador): void {
    if (!confirm(`¿Eliminar al entrenador ${fila.nombre} ${fila.apellido}?`)) return;
    this.cargando.set(true);
    this.entrenadorService.eliminar(fila.id_entrenador).subscribe({
      next: () => { this.avisar('Entrenador eliminado'); this.refrescar(); },
      error: (error: HttpErrorResponse) => { this.avisar(this.textoError(error, false), true); this.cargando.set(false); },
    });
  }

  private cargarTodos(): void {
    this.cargando.set(true);
    this.entrenadorService.listar().subscribe({
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
    return Boolean(d.nombre.trim() && d.apellido.trim() && d.especialidad.trim() && d.salario > 0);
  }

  private datosEdicion(): EntrenadorUpdate {
    return {
      nombre: this.formulario.nombre.trim(),
      apellido: this.formulario.apellido.trim(),
      especialidad: this.formulario.especialidad.trim(),
      telefono: this.formulario.telefono.trim(),
      salario: this.formulario.salario
    };
  }

  private formularioVacio(): EntrenadorCreate {
    return { nombre: '', apellido: '', especialidad: '', telefono: '', salario: 0 };
  }

  private avisar(texto: string, error = false): void {
    this.mensaje.set(texto);
    this.esError.set(error && texto.length > 0);
  }

  private textoError(error: HttpErrorResponse, alListar: boolean): string {
    if (error.status === 0) return 'No se pudo conectar con la API. Revisa que el backend esté en el puerto 8000.';
    if (error.status === 404) return alListar ? 'No hay registros' : 'No encontrado';
    if (error.status === 409) return 'Ese entrenador ya existe';
    if (error.status === 422) return 'Revisa los datos. El filtro por ID tiene que ser un UUID.';
    const detail = error.error?.detail;
    if (typeof detail === 'string') return detail;
    return 'No se pudo completar la operación';
  }
}