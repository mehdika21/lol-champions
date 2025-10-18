// games-page.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';
import { GamesService } from '../../../core/services/games';
import { HeaderSearchComponent } from '../../../shared/header-search/header-search';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
interface Game {
  gameId: string;
  creationTime: number;
  gameDuration: number;
  seasonId: number;
  winner: number;
  firstBlood: number;
  firstTower: number;
  [key: string]: any;
}

@Component({
  selector: 'app-games-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    HeaderSearchComponent,
    RouterModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './games-page.html',
  styleUrls: ['./games-page.scss'],
})
export class GamesPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(GamesService);

  filters = this.fb.nonNullable.group({
    q: '',
  });

  rows = signal<Game[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  columns: ColDef[] = [
    {
      headerName: 'Game ID',
      field: 'gameId',
      sortable: true,
      filter: true,
      minWidth: 150,
    },
    {
      headerName: 'Creation Time',
      field: 'creationTime',
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleString();
      },
    },
    {
      headerName: 'Game Duration',
      field: 'gameDuration',
      sortable: true,
      filter: true,
      cellRenderer: (p: any) => {
        const raw = Number(p.value);
        if (!Number.isFinite(raw) || raw <= 0) return '0m 0s';

        // Heuristic: values > 100000 are probably milliseconds
        const seconds = raw > 100000 ? Math.round(raw / 1000) : Math.round(raw);

        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
      },
      minWidth: 160,
    },
    {
      headerName: 'Season ID',
      field: 'seasonId',
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Winner',
      field: 'winner',
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        return params.value === 1 ? 'Team 1' : 'Team 2';
      },
    },
    {
      headerName: 'First Blood',
      field: 'firstBlood',
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        return params.value === 1 ? 'Team 1' : params.value === 2 ? 'Team 2' : 'N/A';
      },
    },
    {
      headerName: 'First Tower',
      field: 'firstTower',
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        return params.value === 1 ? 'Team 1' : params.value === 2 ? 'Team 2' : 'N/A';
      },
    },
    {
      headerName: 'Actions',
      colId: 'actions',
      width: 110,
      sortable: false,
      filter: false,
      pinned: 'right',
      cellRenderer: () => `
        <button class="action-btn delete-btn" style="
        background: #e53935;
        border: none;
        color: #fff;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        transition: background 0.2s ease;
      " title="Delete">Delete</button>
      `,
    },
  ];

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    const q = this.filters.controls.q.value;
    this.service.list(q).subscribe({
      next: (data) => {
        this.rows.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load games:', err);
        this.error.set('Failed to load games. Check browser console.');
        this.loading.set(false);
        this.rows.set([]);
      },
    });
  }
  onCellClicked(ev: any): void {
    if (ev?.column?.getColId() !== 'actions') return;

    const row: any = ev.data;
    if (!row) return;

    const gameId = String(row.gameId ?? '');
    if (!gameId) return;

    if (!confirm(`Delete game "${gameId}"?`)) return;

    this.loading.set(true);
    this.service.delete(gameId).subscribe({
      next: () => {
        // remove from local rows by gameId
        this.rows.update((list) => list.filter((g: any) => String(g.gameId ?? '') !== gameId));
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to delete game:', err);
        this.error.set('Failed to delete game.');
        this.loading.set(false);
      },
    });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.reload();
    }
  }
}
