import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  readonly titulo = 'Gimnasio ITM';
  readonly retraido = signal(false);

  readonly menu = [
    { ruta: '/miembros', etiqueta: 'Miembros', icono: 'person' },
    { ruta: '/membresias', etiqueta: 'Membresías', icono: 'card_membership' },
    { ruta: '/inscripciones', etiqueta: 'Inscripciones', icono: 'how_to_reg' },
    { ruta: '/pagos', etiqueta: 'Pagos', icono: 'payments' },
    { ruta: '/entrenadores', etiqueta: 'Entrenadores', icono: 'fitness_center' },
    { ruta: '/clases', etiqueta: 'Clases', icono: 'groups' },
    { ruta: '/reservas', etiqueta: 'Reservas', icono: 'event_available' },
    { ruta: '/rutinas', etiqueta: 'Rutinas', icono: 'checklist' },
  ];
  
  alternar() {
    this.retraido.update(v => !v);
  }
}