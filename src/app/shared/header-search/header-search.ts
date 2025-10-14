import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';

export interface HeaderNavLink {
  label: string;
  path: string;
}

@Component({
  selector: 'app-header-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './header-search.html',
  styleUrls: ['./header-search.scss'],
})
export class HeaderSearchComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() placeholder = 'Search...';
  @Input() loading = false;
  @Input() control!: FormControl<string>;   // ← this is what we bind to
  @Input() nav: HeaderNavLink[] = [];

  @Output() submit = new EventEmitter<void>();

  onKeyPress(e: KeyboardEvent) {
    if (e.key === 'Enter') this.submit.emit();
  }
}
