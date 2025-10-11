// champions.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Champion } from '../models/champion.model';
import { SEED_DB } from '../../app.config';

@Injectable({ providedIn: 'root' })
export class ChampionsService {
  private seed = inject(SEED_DB);

  list(q?: string): Observable<Champion[]> {
    let data = this.seed.champions ?? [];
    
    if (q) {
      const query = q.toLowerCase();
      data = data.filter(c => 
        `${c.name} ${c.title}`.toLowerCase().includes(query)
      );
    }
    
    // Simulate HTTP delay for better UX
    return of(data).pipe(delay(300));
  }
}