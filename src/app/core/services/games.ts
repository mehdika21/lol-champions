import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GamesService {
  private http = inject(HttpClient);

  list(q = ''): Observable<any[]> {
    const params = q ? new HttpParams().set('q', q) : undefined;
    return this.http.get<any[]>('/api/games', { params });
  }

  delete(gameId: string): Observable<void> {
    return this.http.delete<void>(`/api/games/${encodeURIComponent(gameId)}`);
  }
}
