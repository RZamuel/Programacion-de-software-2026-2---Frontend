import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // <-- 1. AGREGA ESTO
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Membresia, MembresiaCreate, MembresiaUpdate } from '../../models/membresia.model';
import { MembresiaService } from '../../services/membresia.service';

type ModoPopup = 'crear' | 'editar';

@Component({
  selector: 'app-membresias',
  imports: [CommonModule, FormsModule], // <-- 2. AGREGA CommonModule AQUÍ
  templateUrl: './membresias.html',
  styleUrl: './membresias.css',
})
export class Membresias implements OnInit {
  private readonly membresiaService = inject(MembresiaService);

  readonly filas = signal<Membresia[]>([]);
  readonly mensaje = signal('');
  readonly esError = signal(false);
  readonly cargando = signal(false);
  readonly popupAbierto = signal(false);
  readonly modo = signal<ModoPopup>('crear');

  idFiltro = '';
  formulario: MembresiaCreate = this.formularioVacio();
  private idEditando = '';

  ngOnInit(): void { this.cargarTodos(); }

  buscarPorId(): void {
    const id = this.idFiltro.trim();
    if (!id) { this.cargarTodos(); return; }
    this.cargando.set(true);
    this.membresiaService.obtener(id).subscribe({
      next: (membresia) => { this.filas.set([membresia]); this.avisar(''); this.cargando.set(false); },
      error: (error: HttpErrorResponse) => { this.filas.set([]); this.avisar(this.textoError(error, false), true); this.cargando.set(false); },
    });
  }

  limpiarFiltro(): void { this.idFiltro = ''; this.cargarTodos(); }

  abrirCrear(): void {
    this.modo.set('crear'); this.idEditando = '';
    this.formulario = this.formularioVacio(); this.popupAbierto.set(true);
  }

  abrirEditar(fila: Membresia): void {
    this.modo.set('editar'); this.idEditando = fila.id_membresia;
    this.formulario = {
      tipo: fila.tipo,
      precio: fila.precio,
      duracion_dias: fila.duracion_dias,
      fecha_inicio: fila.fecha_inicio,
      estado: fila.estado
    };
    this.popupAbierto.set(true);
  }

  cerrarPopup(): void { this.popupAbierto.set(false); }

  guardar(): void {
    if (!this.formularioValido()) { this.avisar('Completa el tipo, precio y duración.', true); return; }
    this.cargando.set(true);
    if (this.modo() === 'crear') {
      this.membresiaService.crear(this.formulario).subscribe({
        next: () => this.despuesDeGuardar('Membresía creada'),
        error: (error: HttpErrorResponse) => this.falloGuardar(error),
      });
    } else {
      this.membresiaService.actualizar(this.idEditando, this.datosEdicion()).subscribe({
        next: () => this.despuesDeGuardar('Membresía actualizada'),
        error: (error: HttpErrorResponse) => this.falloGuardar(error),
      });
    }
  }

  eliminar(fila: Membresia): void {
    if (!confirm(`¿Eliminar la membresía ${fila.tipo}?`)) return;
    this.cargando.set(true);
    this.membresiaService.eliminar(fila.id_membresia).subscribe({
      next: () => { this.avisar('Membresía eliminada'); this.refrescar(); },
      error: (error: HttpErrorResponse) => { this.avisar(this.textoError(error, false), true); this.cargando.set(false); },
    });
  }

  private cargarTodos(): void {
    this.cargando.set(true);
    this.membresiaService.listar().subscribe({
      next: (respuesta) => {
        const filas = respuesta.data ?? []; this.filas.set(filas);
        this.avisar(filas.length ? '' : 'No hay registros'); this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.filas.set([]); const listaVacia = error.status === 404;
        this.avisar(listaVacia ? 'No hay registros' : this.textoError(error, true), !listaVacia); this.cargando.set(false);
      },
    });
  }

  private refrescar(): void { if (this.idFiltro.trim()) { this.buscarPorId(); return; } this.cargarTodos(); }
  private despuesDeGuardar(texto: string): void { this.popupAbierto.set(false); this.avisar(texto); this.refrescar(); }
  private falloGuardar(error: HttpErrorResponse): void { this.avisar(this.textoError(error, false), true); this.cargando.set(false); }

  private formularioValido(): boolean {
    const d = this.formulario;
    return Boolean(d.tipo.trim() && d.precio > 0 && d.duracion_dias > 0 && d.fecha_inicio && d.estado.trim());
  }

  private datosEdicion(): MembresiaUpdate {
    return {
      tipo: this.formulario.tipo.trim(),
      precio: this.formulario.precio,
      duracion_dias: this.formulario.duracion_dias,
      fecha_inicio: this.formulario.fecha_inicio,
      estado: this.formulario.estado.trim()
    };
  }

  private formularioVacio(): MembresiaCreate {
    return { tipo: '', precio: 0, duracion_dias: 0, fecha_inicio: new Date().toISOString().split('T')[0], estado: 'activa' };
  }

  private avisar(texto: string, error = false): void { this.mensaje.set(texto); this.esError.set(error && texto.length > 0); }

  private textoError(error: HttpErrorResponse, alListar: boolean): string {
    if (error.status === 0) return 'No se pudo conectar con la API. Revisa que el backend esté en el puerto 8000.';
    if (error.status === 404) return alListar ? 'No hay registros' : 'No encontrado';
    if (error.status === 409) return 'Esa membresía ya existe';
    if (error.status === 422) return 'Revisa los datos. El filtro por ID tiene que ser un UUID.';
    const detail = error.error?.detail;
    if (typeof detail === 'string') return detail;
    return 'No se pudo completar la operación';
  }
}