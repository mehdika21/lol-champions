
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GamesService {
  private readonly assetsUrl = 'assets/data/games.csv';

  constructor(private readonly http: HttpClient) {}

  list(q: string = ''): Observable<any[]> {
    const query = (q ?? '').toLowerCase();
    return this.http.get(this.assetsUrl, { responseType: 'text' }).pipe(
      map(csv => {
        // Simple CSV parsing (assumes header row)
        const [headerLine, ...lines] = csv.split(/\r?\n/).filter(l => l.trim());
        const headers = headerLine.split(',');
        const arr = lines.map(line => {
          const values = line.split(',');
          const obj: any = {};
          headers.forEach((h, i) => obj[h.trim()] = values[i]?.trim());
          return obj;
        });
        if (!query) return arr;
        return arr.filter(g =>
          Object.values(g).some(v => String(v ?? '').toLowerCase().includes(query))
        );
      })
    );
  }
}
