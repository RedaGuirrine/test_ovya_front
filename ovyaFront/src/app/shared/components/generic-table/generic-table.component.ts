import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { ColumnConfig } from './column-config.model';

@Component({
  selector: 'app-generic-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.css']
})
export class GenericTableComponent<T = any> implements OnInit, OnChanges, OnDestroy {
  /** Titre affiché au dessus du tableau */
  @Input() title = 'Liste';

  /** Définition des colonnes */
  @Input() columns: ColumnConfig[] = [];

  /** Données brutes à afficher */
  @Input() data: T[] = [];

  /** Nombre total d'éléments (pour la pagination serveur) */
  @Input() totalElements = 0;

  /** Taille de page par défaut */
  @Input() pageSize = 10;

  /** Options de taille de page */
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];

  /** Afficher le statut de chargement */
  @Input() isLoading = false;

  /** Afficher la colonne d'actions (supprimer) */
  @Input() showActions = true;

  /** Message quand aucune donnée */
  @Input() emptyMessage = 'Aucune donnée trouvée.';

  /** Événement de changement de page */
  @Output() pageChange = new EventEmitter<PageEvent>();

  /** Événement de filtrage (debouncé) */
  @Output() filterChange = new EventEmitter<{ [key: string]: string }>();

  /** Événement de tri */
  @Output() sortChange = new EventEmitter<{ key: string, direction: 'asc' | 'desc' }>();

  /** Événement de suppression (émet l'id de l'élément) */
  @Output() deleteItem = new EventEmitter<number>();

  dataSource = new MatTableDataSource<T>([]);
  displayedColumns: string[] = [];
  filterColumns: string[] = [];

  /** État du tri actuel */
  currentSort: { key: string, direction: 'asc' | 'desc' } = { key: 'id', direction: 'asc' };

  /** Filtres par colonne */
  columnFilters: { [key: string]: string } = {};
  
  private filterSubject = new Subject<{ [key: string]: string }>();
  private filterSub?: Subscription;

  ngOnInit(): void {
    this.filterSub = this.filterSubject.pipe(
      debounceTime(500)
    ).subscribe(filters => {
      this.filterChange.emit(filters);
    });
  }

  ngOnDestroy(): void {
    if (this.filterSub) {
      this.filterSub.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.dataSource.data = this.data || [];
    }
    if (changes['columns']) {
      this.buildDisplayedColumns();
    }
  }

  private buildDisplayedColumns(): void {
    // Ligne de filtre + colonnes de données + actions
    this.displayedColumns = this.columns.map(c => c.key);
    this.filterColumns = this.columns.map(c => 'filter_' + c.key);
    
    if (this.showActions) {
      this.displayedColumns.push('actions');
      this.filterColumns.push('filter_actions');
    }
  }

  /** Récupère la valeur formatée d'une cellule */
  getCellValue(element: any, col: ColumnConfig): string {
    if (col.valueAccessor) {
      return col.valueAccessor(element);
    }

    let value = element[col.key];

    if (col.type === 'date' && value) {
      return new Date(value).toLocaleString('fr-FR');
    }

    if (col.type === 'boolean') {
      if (col.invertBooleanValue) {
        value = !value;
      }
      return value ? (col.trueLabel || 'Oui') : (col.falseLabel || 'Non');
    }

    return value != null ? String(value) : 'N/A';
  }

  /** Vérifie si une colonne est de type boolean (pour le styling) */
  isBooleanColumn(col: ColumnConfig): boolean {
    return col.type === 'boolean';
  }

  /** Vérifie si la valeur booléenne est true (considère l'inversion) */
  getBooleanValue(element: any, col: ColumnConfig): boolean {
    let value: boolean;
    if (col.valueAccessor) {
      const raw = element[col.key];
      value = !!raw;
    } else {
      value = !!element[col.key];
    }
    
    return col.invertBooleanValue ? !value : value;
  }

  /** Vérifie si une colonne est filtrable */
  isFilterable(col: ColumnConfig): boolean {
    return col.filterable !== false;
  }

  /** Déclenche le Subject pour émettre au parent après un délai */
  applyFilters(): void {
    this.filterSubject.next({ ...this.columnFilters });
  }

  onPageChanged(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  onDelete(element: any): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      this.deleteItem.emit(element.id);
    }
  }

  toggleSort(key: string): void {
    if (this.currentSort.key === key) {
      this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort.key = key;
      this.currentSort.direction = 'asc';
    }
    this.sortChange.emit({ ...this.currentSort });
  }

  getSortIcon(key: string): string {
    if (this.currentSort.key !== key) return 'swap_vert';
    return this.currentSort.direction === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }
}
