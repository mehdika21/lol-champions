
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChampionsService {
  private readonly assetsUrl = 'assets/data/champion_info_2.json';

  constructor(private http: HttpClient) {}

  list(q: string = ''): Observable<any[]> {
    const query = (q ?? '').toLowerCase();
    return this.http.get<any>(this.assetsUrl).pipe(
      map((raw) => {
        const arr: any[] = raw?.data
          ? Object.values(raw.data)
          : Array.isArray(raw) ? raw : [];
        if (!query) return arr;
        return arr.filter(c =>
          (c.name || '').toLowerCase().includes(query) ||
          (c.key || '').toLowerCase().includes(query)
        );
      })
    );
  }
  delete(idOrKey: string): Observable<void> {
    return this.http.delete<void>(`/api/champions/${encodeURIComponent(idOrKey)}`);
  }
}
