import { Acq } from './acq.model';
import { Ccial } from './ccial.model';
import { Dossier } from './dossier.model';

export interface Visite {
  id?: number;
  dateStart: string;
  dateEnd: string;
  acq: Acq;
  ccial: Ccial;
  dossier: Dossier;
  canceled: boolean;
}
