import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { PageEvent } from '@angular/material/paginator';
import { Validators } from '@angular/forms';

import { AcqService } from '../../../core/services/acq.service';
import { Acq } from '../../../core/models/acq.model';
import { GenericFormComponent } from '../../../shared/components/generic-form/generic-form.component';
import { GenericTableComponent } from '../../../shared/components/generic-table/generic-table.component';
import { FormFieldConfig } from '../../../shared/components/generic-form/form-field-config.model';
import { ColumnConfig } from '../../../shared/components/generic-table/column-config.model';

@Component({
  selector: 'app-acq-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, GenericFormComponent, GenericTableComponent],
  template: `
    <div class="page-container">
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>Nouvel Acquéreur</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <app-generic-form
            [fields]="formFields"
            [isLoading]="isSaving()"
            submitLabel="Créer l'Acquéreur"
            (formSubmit)="onCreate($event)">
          </app-generic-form>
        </mat-card-content>
      </mat-card>

      <app-generic-table
        title="Liste des Acquéreurs"
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
export class AcqPageComponent implements OnInit {
  data = signal<Acq[]>([]);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  totalElements = signal<number>(0);
  pageSize = 10;
  pageIndex = 0;
  currentSort = 'id,asc';
  filters: any = {};

  formFields: FormFieldConfig[] = [
    { key: 'nom', label: 'Nom Complet', type: 'text', validators: [Validators.required] },
    { key: 'email', label: 'Email', type: 'text', validators: [Validators.required, Validators.email] },
    { key: 'password', label: 'Mot de passe', type: 'text', validators: [Validators.required] }
  ];

  columns: ColumnConfig[] = [
    { key: 'id', header: 'ID', type: 'number' },
    { key: 'nom', header: 'Nom', type: 'text' },
    { key: 'email', header: 'Email', type: 'text' }
  ];

  constructor(private acqService: AcqService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.acqService.getAcqs(this.pageIndex, this.pageSize, this.currentSort, this.filters).subscribe({
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
    this.acqService.createAcq(val).subscribe({
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
    this.acqService.deleteAcq(id).subscribe(() => this.loadData());
  }
}
