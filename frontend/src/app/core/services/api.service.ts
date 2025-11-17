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

  // Air Conditioner Models (Catalog)
  getAirConditioners(filters?: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/air-conditioner-models`, { params: filters });
  }

  getAirConditioner(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/air-conditioner-models/${id}`);
  }

  createAirConditioner(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/air-conditioner-models`, data);
  }

  updateAirConditioner(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/air-conditioner-models/${id}`, data);
  }

  getRecommendedAirConditioners(area: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/air-conditioner-models/recommend`, { params: { area: area.toString() } });
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

  // Dashboard
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/stats`);
  }

  getDashboardInfoBoxes(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/info-boxes`);
  }

  getDashboardQuotationsTimeline(period: string = 'monthly', months: number = 7): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/quotations-timeline`, {
      params: { period, months: months.toString() }
    });
  }

  getDashboardQuotationsByStatus(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/quotations-by-status`);
  }
}
