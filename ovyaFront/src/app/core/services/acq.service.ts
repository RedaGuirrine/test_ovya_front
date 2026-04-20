import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Acq } from '../models/acq.model';
import { Page } from '../models/page.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AcqService {
  private apiUrl = `${environment.apiUrl}/acqs`;

  constructor(private http: HttpClient) {}

  searchAcqs(query: string): Observable<Acq[]> {
    const params = new HttpParams()
      .set('nom', query)
      .set('size', '20');
    
    return this.http.get<Page<Acq>>(this.apiUrl, { params }).pipe(
      map(page => page.content || [])
    );
  }

  getAcqs(page: number, size: number, sort: string, filters: any): Observable<Page<Acq>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (filters.nom) params = params.set('nom', filters.nom);
    if (filters.email) params = params.set('email', filters.email);

    return this.http.get<Page<Acq>>(this.apiUrl, { params });
  }

  createAcq(acq: Acq): Observable<Acq> {
    return this.http.post<Acq>(this.apiUrl, acq);
  }

  deleteAcq(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
