import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BillService {
  constructor(private http: HttpClient) {}

  upload(file: File): Observable<any> {
    const fd = new FormData();
    fd.append('file', file, file.name);
    return this.http.post('/api/uploads/bill', fd);
  }

  extract(id: string): Observable<any> {
    return this.http.post(`/api/uploads/${id}/extract`, {});
  }

  process(id: string): Observable<any> {
    return this.http.post(`/api/uploads/${id}/process`, {});
  }

  setConsent(id: string, includePII: boolean): Observable<any> {
    return this.http.post(`/api/uploads/${id}/consent`, { includePII });
  }
}
