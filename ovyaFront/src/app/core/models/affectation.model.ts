import { Dossier } from './dossier.model';
import { Ccial } from './ccial.model';

export interface Affectation {
  id?: number;
  dossier: Dossier;
  ccial: Ccial;
  dateStart?: string;
  dateEnd?: string;
}
