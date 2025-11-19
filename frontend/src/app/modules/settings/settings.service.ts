import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private baseUrl = `${environment.apiUrl}/settings`;

    constructor(private http: HttpClient) { }

    getIntegrationConfig(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/integration`);
    }

    updateIntegrationConfig(config: any): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/integration`, config);
    }
}
