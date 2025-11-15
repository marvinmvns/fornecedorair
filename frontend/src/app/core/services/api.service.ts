import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Quotations
  getQuotations(filters?: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/quotations`, { params: filters });
  }

  getQuotation(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/quotations/${id}`);
  }

  createQuotation(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/quotations`, data);
  }

  dispatchSuppliers(quotationId: string, supplierIds: string[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/quotations/${quotationId}/dispatch-suppliers`, { supplierIds });
  }

  getSupplierQuotes(quotationId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/quotations/${quotationId}/supplier-quotes`);
  }

  getChatHistory(quotationId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/quotations/${quotationId}/chat-history`);
  }

  // Catalog
  getAirConditioners(filters?: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/catalog/air-conditioners`, { params: filters });
  }

  getAirConditioner(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/catalog/air-conditioners/${id}`);
  }

  createAirConditioner(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/catalog/air-conditioners`, data);
  }

  updateAirConditioner(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/catalog/air-conditioners/${id}`, data);
  }

  // Suppliers
  getSuppliers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/suppliers`);
  }

  getSupplier(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/suppliers/${id}`);
  }

  createSupplier(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/suppliers`, data);
  }

  updateSupplier(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/suppliers/${id}`, data);
  }

  // Orders
  createOrder(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/orders`, data);
  }

  sendOrderToInstaller(orderId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/orders/${orderId}/send-to-installer`, {});
  }
}
