import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private api_url = environment.apiUrl;
  private dataUpdateSource = new Subject<void>();

  dataUpdate$ = this.dataUpdateSource.asObservable();

  constructor(private http: HttpClient) { }

  getData(): Observable<any> {
    return this.http.get<any[]>(`${this.api_url}`);
  }

  getDataByStatus(status: string): Observable<any> {
    return this.http.get<any[]>(`${this.api_url}/status/${status}`);
  }

  getDataById(id: number): Observable<any> {
    return this.http.get<any[]>(`${this.api_url}/${id}`);
  }

  createData(postData: any): Observable<any> {
    return this.http.post<any>(this.api_url, postData);
  }

  updateData(id: number, postData: any): Observable<any> {
    return this.http.put<any>(`${this.api_url}/${id}`, postData);
  }

  deleteData(id:number): Observable<any> {
    return this.http.delete<any>(`${this.api_url}/${id}`);
  }

  notifydataUpdate(){
    this.dataUpdateSource.next();
  }

}
