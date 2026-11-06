import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';
import { Miembros } from './pages/miembros/miembros';
import { Membresias } from './pages/membresias/membresias';
import { Inscripciones } from './pages/inscripciones/inscripciones';
import { Pagos } from './pages/pagos/pagos';
import { Entrenadores } from './pages/entrenadores/entrenadores';
import { Clases } from './pages/clases/clases';
import { Reservas } from './pages/reservas/reservas';
import { Rutinas } from './pages/rutinas/rutinas';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'miembros' },
      { path: 'miembros', component: Miembros },
      { path: 'membresias', component: Membresias },
      { path: 'inscripciones', component: Inscripciones },
      { path: 'pagos', component: Pagos },
      { path: 'entrenadores', component: Entrenadores },
      { path: 'clases', component: Clases },
      { path: 'reservas', component: Reservas },
      { path: 'rutinas', component: Rutinas },
    ],
  },
  { path: '**', redirectTo: 'miembros' },
];