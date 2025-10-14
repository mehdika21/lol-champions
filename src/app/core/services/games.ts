// games.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { SEED_DB, SeedDb } from '../../app.config';

@Injectable({ providedIn: 'root' })
export class GamesService {
  private seed = inject(SEED_DB);

  list(q?: string): Observable<any[]> {
    let data = this.seed.games ?? [];
    
    if (q) {
      const query = q.toLowerCase();
      data = data.filter(g => 
        `${g.gameId}`.toLowerCase().includes(query)
      );
    }
    
    // Simulate HTTP delay for better UX
    return of(data).pipe(delay(300));
  }
}