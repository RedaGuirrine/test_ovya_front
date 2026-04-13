import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, startWith } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { FormFieldConfig } from './form-field-config.model';

@Component({
  selector: 'app-generic-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDatepickerModule,
    MatIconModule
  ],
  templateUrl: './generic-form.component.html',
  styleUrls: ['./generic-form.component.css']
})
export class GenericFormComponent implements OnInit, OnChanges {
  @Input() fields: FormFieldConfig[] = [];
  @Input() submitLabel = 'Valider';
  @Input() isLoading = false;

  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();

  form!: FormGroup;
  autocompleteOptions: { [key: string]: Observable<any[]> } = {};

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fields'] && !changes['fields'].firstChange) {
      this.buildForm();
    }
  }

  private buildForm(): void {
    const group: any = {};

    // 1. Initialiser les contrôles
    this.fields.forEach(field => {
      group[field.key] = new FormControl('', field.validators || []);
    });

    // 2. Créer le FormGroup
    this.form = this.fb.group(group);

    // 3. Configurer les autocomplétions maintenant que le formulaire existe
    this.fields.forEach(field => {
      if (field.type === 'autocomplete' && field.autocompleteConfig) {
        this.setupAutocomplete(field);
      }
    });
  }

  private setupAutocomplete(field: FormFieldConfig): void {
    const config = field.autocompleteConfig!;
    this.autocompleteOptions[field.key] = this.getControl(field.key).valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        const query = typeof value === 'string' ? value : '';
        return config.searchMethod(query);
      })
    );
  }

  getControl(key: string): FormControl {
    return this.form.get(key) as FormControl;
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  displayFn(field: FormFieldConfig): (item: any) => string {
    return (item: any) => {
      if (!item) return '';
      return field.autocompleteConfig?.displayFn(item) || '';
    };
  }
}
