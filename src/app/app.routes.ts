import { Routes } from '@angular/router';
import { ChampionsPageComponent } from './features/champions/champions-page/champions-page';

export const routes: Routes = [
  { path: '', component: ChampionsPageComponent },
  { path: '**', redirectTo: '' },
];
