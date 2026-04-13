/**
 * Configuration d'une colonne pour le GenericTableComponent.
 * Permet de définir dynamiquement les colonnes sans duplication de code.
 */
export interface ColumnConfig {
  /** Clé technique (ex: 'id', 'dateStart', 'acq.nom') */
  key: string;

  /** Libellé affiché dans l'en-tête du tableau */
  header: string;

  /** Type de donnée pour le formatage et le filtrage */
  type: 'text' | 'date' | 'boolean' | 'nested' | 'number';

  /** Inverser la logique booléenne pour l'affichage (badge et label) */
  invertBooleanValue?: boolean;

  /**
   * Fonction optionnelle pour extraire/formatter la valeur affichée.
   * Si non fournie, on utilise element[key].
   */
  valueAccessor?: (element: any) => any;

  /** Libellé pour les valeurs "true" (type boolean) */
  trueLabel?: string;

  /** Libellé pour les valeurs "false" (type boolean) */
  falseLabel?: string;

  /** Indique si le filtre est activé sur cette colonne (défaut: true) */
  filterable?: boolean;
}
