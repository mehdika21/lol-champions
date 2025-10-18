// features/summoner-spells/summoner-spells-page/summoner-spells-page.component.ts
import { Component, OnInit, inject, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef } from 'ag-grid-community';
import { SummonerSpellsService } from '../../../core/services/summoner-spells';
import { HeaderSearchComponent } from '../../../shared/header-search/header-search';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
interface SummonerSpell {
  id: string | number;
  name: string;
  key: string;
  description: string;
  summonerLevel?: number;
  [k: string]: any;
}

@Component({
  selector: 'app-summoner-spells-page',
  standalone: true,
  imports: [CommonModule, 
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
    MatProgressSpinnerModule,],
  templateUrl: './summoner-spells-page.html',
  styleUrls: ['./summoner-spells-page.scss'],
  encapsulation: ViewEncapsulation.None, // so your theme vars reach the grid
})
export class SummonerSpellsPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(SummonerSpellsService);

  filters = this.fb.nonNullable.group({ q: '' });

  rows = signal<SummonerSpell[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  columns: ColDef[] = [
    // 👇 NEW: Icon column first
    {
      headerName: 'Icon',
      field: 'key',
      width: 80,
      sortable: false,
      filter: false,
      menuTabs: [],
      cellRenderer: (params: any) => {
        const key = params.value as string | undefined;
        if (!key) return '';
        const alt = (params.data?.name ?? 'Spell').replace(/"/g, '&quot;');
        const src = `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/spell/${key}.png`;
        return `
          <img src="${src}"
               alt="${alt}"
               title="${alt}"
               style="width:40px;height:40px;border-radius:6px;display:block;margin:auto;" />
        `;
      },
    },
    { headerName: 'Name', field: 'name', sortable: true, filter: true, minWidth: 150 },
    { headerName: 'Key', field: 'key', sortable: true, filter: true, minWidth: 150 },
    { headerName: 'Level Required', field: 'summonerLevel', sortable: true, filter: true, width: 150 },
    {
      headerName: 'Description',
      field: 'description',
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 300,
      cellRenderer: (p: any) => `<div style="white-space: normal; padding: 6px;">${p.value || 'N/A'}</div>`,
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
        console.error('Failed to load summoner spells:', err);
        this.error.set('Failed to load summoner spells. Check browser console.');
        this.rows.set([]);
        this.loading.set(false);
      },
    });
  }
  onCellClicked(ev: any): void {
      if (ev?.column?.getColId() !== 'actions') return;

      const row: any = ev.data;
      if (!row) return;

      const idOrKey = String(row.id ?? row.key ?? '');
      if (!idOrKey) return;

      const name = row.name ?? idOrKey;
      if (!confirm(`Delete summoner spell "${name}"?`)) return;

      this.loading.set(true);
      this.service.delete(idOrKey).subscribe({
        next: () => {
          this.rows.update(list =>
            list.filter((c: any) => String(c.id ?? c.key ?? '') !== idOrKey)
          );
          this.loading.set(false);
        },
        error: (err: any) => {
          console.error('Failed to delete summoner spell:', err);
          this.error.set('Failed to delete summoner spell.');
          this.loading.set(false);
        },
      });
    }
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.reload();
  }
}
