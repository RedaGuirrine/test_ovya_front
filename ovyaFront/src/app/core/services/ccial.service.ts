import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Ccial } from '../models/ccial.model';
import { Page } from '../models/page.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CcialService {
  private apiUrl = `${environment.apiUrl}/ccials`;

  constructor(private http: HttpClient) {}

  searchCcials(query: string): Observable<Ccial[]> {
    const params = new HttpParams()
      .set('nom', query)
      .set('size', '20');
    
    return this.http.get<Page<Ccial>>(this.apiUrl, { params }).pipe(
      map(page => page.content || [])
    );
  }

  getCcials(page: number, size: number, sort: string, filters: any): Observable<Page<Ccial>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (filters.nom) params = params.set('nom', filters.nom);
    if (filters.email) params = params.set('email', filters.email);

    return this.http.get<Page<Ccial>>(this.apiUrl, { params });
  }

  createCcial(ccial: Ccial): Observable<Ccial> {
    return this.http.post<Ccial>(this.apiUrl, ccial);
  }

  deleteCcial(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
