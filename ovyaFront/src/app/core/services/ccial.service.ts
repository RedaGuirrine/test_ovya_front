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
}
