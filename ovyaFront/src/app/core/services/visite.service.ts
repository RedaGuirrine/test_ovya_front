import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Visite } from '../models/visite.model';
import { Page } from '../models/page.model';
import { CcialVisiteCount } from '../models/ccial-visite-count.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VisiteService {
  private apiUrl = `${environment.apiUrl}/visites`;

  constructor(private http: HttpClient) {}

  getVisites(page: number = 0, size: number = 10, sort: string = 'id,asc', filters?: any): Observable<Page<Visite>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }

    return this.http.get<Page<Visite>>(this.apiUrl, { params });
  }

  createVisite(visite: Visite): Observable<Visite> {
    return this.http.post<Visite>(this.apiUrl, visite);
  }

  deleteVisite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCcialsSurcharges(): Observable<CcialVisiteCount[]> {
    return this.http.get<CcialVisiteCount[]>(`${this.apiUrl}/ccials-surcharges`);
  }
}

