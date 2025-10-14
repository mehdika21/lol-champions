// champions-page.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, Theme } from 'ag-grid-community';
import { ChampionsService } from '../../../core/services/champions';
import { RouterModule } from '@angular/router';
import { Champion } from '../../../core/models/champion.model';
import { HeaderSearchComponent } from '../../../shared/header-search/header-search';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';


@Component({
  selector: 'app-champions-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    HeaderSearchComponent,
    RouterModule
  ],
  templateUrl: './champions-page.html',
  styleUrls: ['./champions-page.scss'],
})
export class ChampionsPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ChampionsService);

  filters = this.fb.nonNullable.group({
    q: '',
  });

  rows = signal<Champion[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  columns: ColDef[] = [
    {
      headerName: 'Icon',
      field: 'key',
      width: 80,
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        return `<img src="https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${params.value}.png" 
                    style="width: 50px; height: 50px; border-radius: 4px;" alt="${params.value}">`;
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
      cellRenderer: (params: any) => {
        if (!Array.isArray(params.value)) return '';
        return params.value.join(', ');
      },
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
        console.error('Failed to load champions:', err);
        this.error.set('Failed to load champions. Check browser console.');
        this.loading.set(false);
        this.rows.set([]);
      },
    });
  }
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.reload();
    }
  }
}