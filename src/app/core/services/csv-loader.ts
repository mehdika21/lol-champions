import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CsvLoaderService {
  constructor(private http: HttpClient) {}

  async loadCsvAsJson(path: string): Promise<any[]> {
    const csv = await firstValueFrom(this.http.get(path, { responseType: 'text' }));
    const lines = csv.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!lines.length) return [];

    const headers = this.splitCsvLine(lines[0]);
    return lines.slice(1).map(line => {
      const cols = this.splitCsvLine(line);
      const obj: any = {};
      headers.forEach((h, i) => (obj[h] = cols[i] ?? ''));
      // optional: cast some fields
      if (obj.creationTime) obj.creationTime = Number(obj.creationTime);
      if (obj.gameDuration) obj.gameDuration = Number(obj.gameDuration);
      if (obj.seasonId) obj.seasonId = Number(obj.seasonId);
      if (obj.winner) obj.winner = Number(obj.winner);
      if (obj.firstBlood) obj.firstBlood = Number(obj.firstBlood);
      if (obj.firstTower) obj.firstTower = Number(obj.firstTower);
      return obj;
    });
  }

  // naive CSV splitter that supports quoted commas
  private splitCsvLine(line: string): string[] {
    const out: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === ',' && !inQuotes) {
        out.push(current); current = '';
      } else {
        current += ch;
      }
    }
    out.push(current);
    return out.map(s => s.trim());
  }
}
