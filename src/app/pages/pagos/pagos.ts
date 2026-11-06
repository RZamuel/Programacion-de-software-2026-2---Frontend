import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Pago, PagoCreate, PagoUpdate } from '../../models/pago.model';
import { PagoService } from '../../services/pago.service';

type ModoPopup = 'crear' | 'editar';

@Component({
  selector: 'app-pagos',
  imports: [CommonModule, FormsModule],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css',
})
export class Pagos implements OnInit {
  private readonly pagoService = inject(PagoService);

  readonly filas = signal<Pago[]>([]);
  readonly mensaje = signal('');
  readonly esError = signal(false);
  readonly cargando = signal(false);
  readonly popupAbierto = signal(false);
  readonly modo = signal<ModoPopup>('crear');

  idFiltro = '';
  formulario: PagoCreate = this.formularioVacio();
  private idEditando = '';

  ngOnInit(): void { this.cargarTodos(); }

  buscarPorId(): void {
    const id = this.idFiltro.trim();
    if (!id) { this.cargarTodos(); return; }
    this.cargando.set(true);
    this.pagoService.obtener(id).subscribe({
      next: (pago) => { this.filas.set([pago]); this.avisar(''); this.cargando.set(false); },
      error: (error: HttpErrorResponse) => { this.filas.set([]); this.avisar(this.textoError(error, false), true); this.cargando.set(false); },
    });
  }

  limpiarFiltro(): void { this.idFiltro = ''; this.cargarTodos(); }

  abrirCrear(): void {
    this.modo.set('crear'); this.idEditando = '';
    this.formulario = this.formularioVacio(); this.popupAbierto.set(true);
  }

  abrirEditar(fila: Pago): void {
    this.modo.set('editar'); this.idEditando = fila.id_pago;
    this.formulario = {
      id_miembro: fila.id_miembro,
      monto: fila.monto,
      fecha_pago: fila.fecha_pago,
      metodo_pago: fila.metodo_pago,
      concepto: fila.concepto
    };
    this.popupAbierto.set(true);
  }

  cerrarPopup(): void { this.popupAbierto.set(false); }

  guardar(): void {
    if (!this.formularioValido()) {
      this.avisar('Completa el ID del miembro, monto, fecha, método y concepto.', true);
      return;
    }
    this.cargando.set(true);
    if (this.modo() === 'crear') {
      this.pagoService.crear(this.formulario).subscribe({
        next: () => this.despuesDeGuardar('Pago registrado'),
        error: (error: HttpErrorResponse) => this.falloGuardar(error),
      });
    } else {
      this.pagoService.actualizar(this.idEditando, this.datosEdicion()).subscribe({
        next: () => this.despuesDeGuardar('Pago actualizado'),
        error: (error: HttpErrorResponse) => this.falloGuardar(error),
      });
    }
  }

  eliminar(fila: Pago): void {
    if (!confirm(`¿Eliminar el pago de $${fila.monto} (${fila.concepto})?`)) return;
    this.cargando.set(true);
    this.pagoService.eliminar(fila.id_pago).subscribe({
      next: () => { this.avisar('Pago eliminado'); this.refrescar(); },
      error: (error: HttpErrorResponse) => { this.avisar(this.textoError(error, false), true); this.cargando.set(false); },
    });
  }

  private cargarTodos(): void {
    this.cargando.set(true);
    this.pagoService.listar().subscribe({
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
      d.monto > 0 &&
      d.fecha_pago &&
      d.metodo_pago.trim() &&
      d.concepto.trim()
    );
  }

  private datosEdicion(): PagoUpdate {
    return {
      id_miembro: this.formulario.id_miembro.trim(),
      monto: this.formulario.monto,
      fecha_pago: this.formulario.fecha_pago,
      metodo_pago: this.formulario.metodo_pago.trim(),
      concepto: this.formulario.concepto.trim()
    };
  }

  private formularioVacio(): PagoCreate {
    return {
      id_miembro: '',
      monto: 0,
      fecha_pago: new Date().toISOString().split('T')[0],
      metodo_pago: 'efectivo',
      concepto: ''
    };
  }

  private avisar(texto: string, error = false): void {
    this.mensaje.set(texto);
    this.esError.set(error && texto.length > 0);
  }

  private textoError(error: HttpErrorResponse, alListar: boolean): string {
    if (error.status === 0) return 'No se pudo conectar con la API. Revisa que el backend esté en el puerto 8000.';
    if (error.status === 404) return alListar ? 'No hay registros' : 'No encontrado';
    if (error.status === 409) return 'Ese pago ya existe';
    if (error.status === 422) return 'Revisa los datos. El ID del miembro tiene que ser un UUID válido.';
    const detail = error.error?.detail;
    if (typeof detail === 'string') return detail;
    return 'No se pudo completar la operación';
  }
}