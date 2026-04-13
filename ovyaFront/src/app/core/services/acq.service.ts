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
      .set('size', '20'); // Limiter pour l'autocomplétion
    
    return this.http.get<Page<Acq>>(this.apiUrl, { params }).pipe(
      map(page => page.content || [])
    );
  }
}
