import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { DossierService } from '../../../core/services/dossier.service';
import { VisiteService } from '../../../core/services/visite.service';
import { AcqService } from '../../../core/services/acq.service';
import { CcialService } from '../../../core/services/ccial.service';
import { Dossier } from '../../../core/models/dossier.model';
import { Visite } from '../../../core/models/visite.model';
import { FormFieldConfig } from '../../../shared/components/generic-form/form-field-config.model';
import { GenericFormComponent } from '../../../shared/components/generic-form/generic-form.component';

@Component({
  selector: 'app-visite-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCheckboxModule,
    GenericFormComponent
  ],
  templateUrl: './visite-form.component.html',
  styleUrls: ['./visite-form.component.css']
})
export class VisiteFormComponent implements OnInit {
  @Output() visiteCreated = new EventEmitter<void>();

  formFields: FormFieldConfig[] = [];
  isLoading = false;

  constructor(
    private dossierService: DossierService,
    private visiteService: VisiteService,
    private acqService: AcqService,
    private ccialService: CcialService
  ) {}

  ngOnInit(): void {
    this.initFormConfig();
  }

  initFormConfig(): void {
    this.formFields = [
      {
        key: 'dateStart',
        label: 'Date de Début',
        type: 'datetime-local',
        validators: [Validators.required]
      },
      {
        key: 'dateEnd',
        label: 'Date de Fin',
        type: 'datetime-local',
        validators: [Validators.required]
      },
      {
        key: 'acq',
        label: 'Acquéreur',
        type: 'autocomplete',
        validators: [Validators.required],
        placeholder: 'Rechercher par nom...',
        autocompleteConfig: {
          searchMethod: (q) => this.acqService.searchAcqs(q),
          displayFn: (item) => item?.nom || '',
          valueFn: (item) => item
        }
      },
      {
        key: 'ccial',
        label: 'Commercial',
        type: 'autocomplete',
        validators: [Validators.required],
        placeholder: 'Rechercher par nom...',
        autocompleteConfig: {
          searchMethod: (q) => this.ccialService.searchCcials(q),
          displayFn: (item) => item?.nom || '',
          valueFn: (item) => item
        }
      },
      {
        key: 'dossier',
        label: 'Dossier',
        type: 'autocomplete',
        validators: [Validators.required],
        placeholder: 'Rechercher par ID...',
        autocompleteConfig: {
          searchMethod: (q) => this.dossierService.searchDossiers(q),
          displayFn: (item) => item?.id ? `Dossier #${item.id}` : '',
          valueFn: (item) => item
        }
      },
      {
        key: 'canceled',
        label: 'Annulée',
        type: 'boolean'
      }
    ];
  }

  onFormSubmit(formValue: any): void {
    this.isLoading = true;
    
    const visite: Visite = {
      dateStart: new Date(formValue.dateStart).toISOString(),
      dateEnd: new Date(formValue.dateEnd).toISOString(),
      acq: formValue.acq?.id ? { id: formValue.acq.id } as any : undefined,
      ccial: formValue.ccial?.id ? { id: formValue.ccial.id } as any : undefined,
      dossier: formValue.dossier?.id ? { id: formValue.dossier.id } as any : undefined,
      canceled: !!formValue.canceled
    };

    this.visiteService.createVisite(visite).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.visiteCreated.emit();
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }
}
