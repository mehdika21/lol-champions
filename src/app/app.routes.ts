import { Routes } from '@angular/router';
import { ChampionsPageComponent } from './features/champions/champions-page/champions-page';
import { GamesPageComponent } from './features/games/games-page/games-page';
import { SummonerSpellsPageComponent } from './features/summoner-spells/summoner-spells-page/summoner-spells-page';

export const routes: Routes = [
  { path: 'champions', component: ChampionsPageComponent },
  { path: 'games', component: GamesPageComponent },
  { path: 'summoner-spells', component: SummonerSpellsPageComponent },
  { path: '', redirectTo: 'champions', pathMatch: 'full' },
  { path: '**', redirectTo: 'champions' },
];