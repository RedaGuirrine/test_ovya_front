import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Dossier } from '../models/dossier.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DossierService {
  private apiUrl = `${environment.apiUrl}/dossiers`;

  constructor(private http: HttpClient) {}

  searchDossiers(query: string): Observable<Dossier[]> {
    let params = new HttpParams();
    if (query) {
      params = params.set('searchId', query);
    }
    return this.http.get<{ content: Dossier[] }>(this.apiUrl, { params }).pipe(
      map((page: { content: Dossier[] }) => page.content || [])
    );
  }

  getDossiers(page: number, size: number, sort: string, filters: any): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (filters.searchId) params = params.set('searchId', filters.searchId);
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);

    return this.http.get<any>(this.apiUrl, { params });
  }

  createDossier(dossier: Dossier): Observable<Dossier> {
    return this.http.post<Dossier>(this.apiUrl, dossier);
  }

  deleteDossier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
