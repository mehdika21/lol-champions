// champions-page.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { ChampionsService } from '../../../core/services/champions';
import { HeaderSearchComponent } from '../../../shared/header-search/header-search';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-champions-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HeaderSearchComponent,
    // Grid
    AgGridAngular,

    // Material
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './champions-page.html',
  styleUrls: ['./champions-page.scss'],
})
export class ChampionsPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ChampionsService);

  // Reactive Form (no template-driven controls)
  filters = this.fb.nonNullable.group({
    q: '',
  });

  rows = signal<ChampionsService[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  columns: ColDef[] = [
    {
      headerName: 'Icon',
      field: 'key',
      width: 80,
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        const key = params.value;
        return `
          <img
            src="https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${key}.png"
            style="width: 40px; height: 40px; border-radius: 6px; display:block; margin:auto;"
            alt="${key}"
          />
        `;
      },
      sortable: false,
      filter: false,
    },
    {
      headerName: 'Name',
      field: 'name',
      flex: 1,
      sortable: true,
      filter: true,
      minWidth: 120,
    },
    {
      headerName: 'Title',
      field: 'title',
      flex: 1.5,
      sortable: true,
      filter: true,
      minWidth: 150,
    },
    {
      headerName: 'Class',
      field: 'tags',
      flex: 1,
      sortable: true,
      filter: true,
      valueFormatter: (p) =>
        Array.isArray(p.value) ? p.value.join(', ') : (p.value ?? ''),
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

    const q = this.filters.controls.q.value?.trim() ?? '';
    this.service.list(q).subscribe({
      next: (data) => {
        this.rows.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load champions:', err);
        this.error.set('Failed to load champions. Check browser console.');
        this.rows.set([]);
        this.loading.set(false);
      },
    });
  }

  clearSearch(): void {
    this.filters.controls.q.setValue('');
    this.reload();
  }
  
 onCellClicked(ev: any): void {
    if (ev?.column?.getColId() !== 'actions') return;

    const row: any = ev.data;
    if (!row) return;

    const idOrKey = String(row.id ?? row.key ?? '');
    if (!idOrKey) return;

    const name = row.name ?? idOrKey;
    if (!confirm(`Delete champion "${name}"?`)) return;

    this.loading.set(true);
    this.service.delete(idOrKey).subscribe({
      next: () => {
        this.rows.update(list =>
          list.filter((c: any) => String(c.id ?? c.key ?? '') !== idOrKey)
        );
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to delete champion:', err);
        this.error.set('Failed to delete champion.');
        this.loading.set(false);
      },
    });
  }
}
