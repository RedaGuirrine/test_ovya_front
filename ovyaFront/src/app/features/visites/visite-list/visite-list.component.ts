import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { PageEvent } from '@angular/material/paginator';

import { VisiteService } from '../../../core/services/visite.service';
import { Visite } from '../../../core/models/visite.model';
import { VisiteFormComponent } from '../visite-form/visite-form.component';
import { GenericTableComponent } from '../../../shared/components/generic-table/generic-table.component';
import { ColumnConfig } from '../../../shared/components/generic-table/column-config.model';

@Component({
  selector: 'app-visite-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    VisiteFormComponent,
    GenericTableComponent
  ],
  templateUrl: './visite-list.component.html',
  styleUrls: ['./visite-list.component.css']
})
export class VisiteListComponent implements OnInit {
  data = signal<Visite[]>([]);
  isLoading = signal<boolean>(true);
  totalElements = signal<number>(0);
  pageSize = signal<number>(10);
  pageIndex = signal<number>(0);
  currentSort = signal<string>('id,asc');

  columns: ColumnConfig[] = [
    { key: 'id', header: 'ID', type: 'number' },
    { key: 'dateStart', header: 'Début', type: 'date' },
    { key: 'dateEnd', header: 'Fin', type: 'date' },
    {
      key: 'dossier',
      header: 'Dossier',
      type: 'number',
      valueAccessor: (e: Visite) => e.dossier?.id ? 'N°' + e.dossier.id : 'N/A'
    },
    {
      key: 'acq',
      header: 'Acquéreur',
      type: 'text',
      valueAccessor: (e: Visite) => e.acq?.nom || 'N/A'
    },
    {
      key: 'ccial',
      header: 'Commercial',
      type: 'text',
      valueAccessor: (e: Visite) => e.ccial?.nom || 'N/A'
    },
    {
      key: 'canceled',
      header: 'Statut',
      type: 'boolean',
      invertBooleanValue: true,
      trueLabel: 'Active',
      falseLabel: 'Annulée'
    }
  ];

  constructor(private visiteService: VisiteService) {}

  ngOnInit(): void {
    this.loadVisites();
  }

  filters: any = {};

  loadVisites(): void {
    this.isLoading.set(true);
    this.visiteService.getVisites(this.pageIndex(), this.pageSize(), this.currentSort(), this.filters).subscribe({
      next: (page) => {
        this.data.set(page.content || []);
        this.totalElements.set(page.totalElements || 0);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
      }
    });
  }

  onSortChange(event: { key: string, direction: 'asc' | 'desc' }): void {
    // Mapping des clés frontend vers les champs backend
    let backendKey = event.key;
    if (backendKey === 'dossier') backendKey = 'dossier.id';
    if (backendKey === 'acq') backendKey = 'acq.id';
    if (backendKey === 'ccial') backendKey = 'ccial.id';

    this.currentSort.set(`${backendKey},${event.direction}`);
    this.pageIndex.set(0);
    this.loadVisites();
  }

  onFilterChange(filters: { [key: string]: string }): void {
    const backendFilters: any = {};
    if (filters['dossier']) backendFilters['dossierId'] = filters['dossier'];
    if (filters['acq']) backendFilters['acqNom'] = filters['acq'];
    if (filters['ccial']) backendFilters['ccialNom'] = filters['ccial'];
    if (filters['canceled']) {
      // L'affichage est inversé (Active = true), donc on ré-inverse pour le backend (canceled = false)
      backendFilters['canceled'] = filters['canceled'] === 'true' ? 'false' : 'true';
    }
    
    // Pour les dates, on mappe selon les besoins du backend
    if (filters['dateStart']) backendFilters['dateStartFrom'] = filters['dateStart'] + 'T00:00:00';
    if (filters['dateEnd']) backendFilters['dateEndTo'] = filters['dateEnd'] + 'T23:59:59';

    this.filters = backendFilters;
    this.pageIndex.set(0);
    this.loadVisites();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadVisites();
  }

  onDelete(id: number): void {
    this.visiteService.deleteVisite(id).subscribe({
      next: () => this.loadVisites()
    });
  }
}
