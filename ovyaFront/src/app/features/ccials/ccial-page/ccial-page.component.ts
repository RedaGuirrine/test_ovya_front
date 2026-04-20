import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { PageEvent } from '@angular/material/paginator';
import { Validators } from '@angular/forms';

import { CcialService } from '../../../core/services/ccial.service';
import { VisiteService } from '../../../core/services/visite.service';
import { Ccial } from '../../../core/models/ccial.model';
import { CcialVisiteCount } from '../../../core/models/ccial-visite-count.model';
import { GenericFormComponent } from '../../../shared/components/generic-form/generic-form.component';
import { GenericTableComponent } from '../../../shared/components/generic-table/generic-table.component';
import { FormFieldConfig } from '../../../shared/components/generic-form/form-field-config.model';
import { ColumnConfig } from '../../../shared/components/generic-table/column-config.model';

@Component({
  selector: 'app-ccial-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, GenericFormComponent, GenericTableComponent],
  template: `
    <div class="page-container">
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>Nouveau Commercial</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <app-generic-form
            [fields]="formFields"
            [isLoading]="isSaving()"
            submitLabel="Créer le Commercial"
            (formSubmit)="onCreate($event)">
          </app-generic-form>
        </mat-card-content>
      </mat-card>

      <app-generic-table
        title="Liste des Commerciaux"
        [columns]="columns"
        [data]="data()"
        [totalElements]="totalElements()"
        [isLoading]="isLoading()"
        (sortChange)="onSortChange($event)"
        (filterChange)="onFilterChange($event)"
        (pageChange)="onPageChange($event)"
        (deleteItem)="onDelete($event)">
      </app-generic-table>

      <app-generic-table
        title="Commerciaux Surchargés (> 5 visites/jour)"
        [columns]="columnsSurcharges"
        [data]="surchargesData()"
        [totalElements]="surchargesData().length"
        [isLoading]="isLoadingSurcharges()"
        [showActions]="false"
        emptyMessage="Aucun commercial surchargé.">
      </app-generic-table>
    </div>

  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 24px; }
    .form-card { margin-bottom: 8px; }
  `]
})
export class CcialPageComponent implements OnInit {
  data = signal<Ccial[]>([]);
  surchargesData = signal<CcialVisiteCount[]>([]);
  isLoading = signal<boolean>(true);
  isLoadingSurcharges = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  totalElements = signal<number>(0);
  pageSize = 10;
  pageIndex = 0;
  currentSort = 'id,asc';
  filters: any = {};

  formFields: FormFieldConfig[] = [
    { key: 'nom', label: 'Nom Complet', type: 'text', validators: [Validators.required] },
    { key: 'email', label: 'Email', type: 'text', validators: [Validators.required, Validators.email] }
  ];

  columns: ColumnConfig[] = [
    { key: 'id', header: 'ID', type: 'number' },
    { key: 'nom', header: 'Nom', type: 'text' },
    { key: 'email', header: 'Email', type: 'text' }
  ];

  columnsSurcharges: ColumnConfig[] = [
    { key: 'ccialId', header: 'ID Commercial', type: 'number' },
    { key: 'dateVisite', header: 'Date', type: 'date' },
    { key: 'nombreVisites', header: 'Nombre de Visites', type: 'number' },
    { 
      key: 'dossierIds', 
      header: 'Dossiers Concernés', 
      type: 'text',
      valueAccessor: (item: CcialVisiteCount) => item.dossierIds ? item.dossierIds.join(', ') : ''
    }
  ];

  constructor(
    private ccialService: CcialService,
    private visiteService: VisiteService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadSurcharges();
  }

  loadSurcharges(): void {
    this.isLoadingSurcharges.set(true);
    this.visiteService.getCcialsSurcharges().subscribe({
      next: (data) => {
        this.surchargesData.set(data || []);
        this.isLoadingSurcharges.set(false);
      },
      error: () => this.isLoadingSurcharges.set(false)
    });
  }

  loadData(): void {
    this.isLoading.set(true);
    this.ccialService.getCcials(this.pageIndex, this.pageSize, this.currentSort, this.filters).subscribe({
      next: (page) => {
        this.data.set(page.content || []);
        this.totalElements.set(page.totalElements || 0);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onCreate(val: any): void {
    this.isSaving.set(true);
    this.ccialService.createCcial(val).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.loadData();
      },
      error: () => this.isSaving.set(false)
    });
  }

  onSortChange(event: any): void {
    this.currentSort = `${event.key},${event.direction}`;
    this.loadData();
  }

  onFilterChange(filters: any): void {
    this.filters = filters;
    this.pageIndex = 0;
    this.loadData();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  onDelete(id: number): void {
    this.ccialService.deleteCcial(id).subscribe(() => this.loadData());
  }
}
