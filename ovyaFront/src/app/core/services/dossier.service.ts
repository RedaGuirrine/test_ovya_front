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
}
