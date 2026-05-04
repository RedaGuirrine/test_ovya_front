import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { PageEvent } from '@angular/material/paginator';
import { Validators } from '@angular/forms';

import { DossierService } from '../../../core/services/dossier.service';
import { CcialService } from '../../../core/services/ccial.service';
import { Dossier } from '../../../core/models/dossier.model';
import { GenericFormComponent } from '../../../shared/components/generic-form/generic-form.component';
import { GenericTableComponent } from '../../../shared/components/generic-table/generic-table.component';
import { FormFieldConfig } from '../../../shared/components/generic-form/form-field-config.model';
import { ColumnConfig } from '../../../shared/components/generic-table/column-config.model';

@Component({
  selector: 'app-dossier-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, GenericFormComponent, GenericTableComponent],
  template: `
    <div class="page-container">
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>Nouveau Dossier</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <!-- Le formulaire de Dossier est simple car le backend génère souvent les IDs,
               mais on peut vouloir saisir une date d'ouverture ou autre si le modèle le permet. -->
          <app-generic-form
            [fields]="formFields"
            [isLoading]="isSaving()"
            submitLabel="Créer le Dossier"
            (formSubmit)="onCreate($event)">
          </app-generic-form>
        </mat-card-content>
      </mat-card>

      <app-generic-table
        title="Liste des Dossiers"
        [columns]="columns"
        [data]="data()"
        [totalElements]="totalElements()"
        [isLoading]="isLoading()"
        (sortChange)="onSortChange($event)"
        (filterChange)="onFilterChange($event)"
        (pageChange)="onPageChange($event)"
        (deleteItem)="onDelete($event)">
      </app-generic-table>
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 24px; }
    .form-card { margin-bottom: 8px; }
  `]
})
export class DossierPageComponent implements OnInit {
  data = signal<Dossier[]>([]);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  totalElements = signal<number>(0);
  pageSize = 10;
  pageIndex = 0;
  currentSort = 'id,asc';
  filters: any = {};

  formFields: FormFieldConfig[] = [
    { 
      key: 'ccial', 
      label: 'Commercial Associé', 
      type: 'autocomplete',
      placeholder: 'Rechercher un commercial...',
      autocompleteConfig: {
        displayFn: (item: any) => item?.nom || '',
        valueFn: (item: any) => item,
        searchMethod: (query: string) => this.ccialService.searchCcials(query)
      }
    }
  ];

  columns: ColumnConfig[] = [
    { key: 'id', header: 'ID / N° de Dossier', type: 'number' },
    { 
      key: 'ccial', 
      header: 'Commercial', 
      type: 'text',
      valueAccessor: (item: Dossier) => item.ccial?.nom || 'Non assigné'
    }
  ];

  constructor(
    private dossierService: DossierService,
    private ccialService: CcialService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.dossierService.getDossiers(this.pageIndex, this.pageSize, this.currentSort, this.filters).subscribe({
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
    const dossierData: any = {
      dateInsert: new Date().toISOString(),
      ccial: val.ccial?.id ? { id: val.ccial.id } : undefined // Envoi uniquement de l'ID
    };
    
    this.dossierService.createDossier(dossierData).subscribe({
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
    const backendFilters: any = {};
    if (filters.id) backendFilters.searchId = filters.id;
    
    this.filters = backendFilters;
    this.pageIndex = 0;
    this.loadData();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  onDelete(id: number): void {
    this.dossierService.deleteDossier(id).subscribe(() => this.loadData());
  }
}
