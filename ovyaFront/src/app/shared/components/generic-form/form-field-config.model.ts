import { Observable } from 'rxjs';
import { ValidatorFn } from '@angular/forms';

export interface AutocompleteConfig {
  searchMethod: (query: string) => Observable<any[]>;
  displayFn: (item: any) => string;
  valueFn: (item: any) => any;
}

export interface FormFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'date' | 'boolean' | 'number' | 'autocomplete' | 'datetime-local';
  validators?: ValidatorFn[];
  placeholder?: string;
  autocompleteConfig?: AutocompleteConfig;
  /** Label pour les booleens (ex: True Label/False Label) */
  trueLabel?: string;
  falseLabel?: string;
}
