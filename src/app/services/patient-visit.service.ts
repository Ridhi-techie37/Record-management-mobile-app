import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface PatientVisit {
  id: number;
  patientId: number;
  patientName?: string;
  cardUid?: string;
  visitDate: string;
  visitTime: string;
  totalAmount?: number;
  receivedAmount?: number;
  balance?: number;
}

/** Paged response from GET /api/PatientVisit/paged */
export interface PagedVisitResponse {
  patientVisit: PatientVisit[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

/** Single treatment record from GET /api/PatientTreatment (per visit) */
export interface PatientTreatment {
  id: number;
  patientVisitId: number;
  doctorComment?: string;
  patientFeedback?: string;
  allergies?: string;
  mapXray?: string;
  mapPrescription?: string;
  treatments?: string;
}

function mapPatientVisit(raw: any): PatientVisit {
  return {
    id: raw?.id ?? raw?.Id ?? 0,
    patientId: raw?.patientId ?? raw?.PatientId ?? 0,
    patientName: raw?.patientName ?? raw?.PatientName,
    cardUid: raw?.cardUid ?? raw?.CardUid,
    visitDate: raw?.visitDate ?? raw?.VisitDate ?? '',
    visitTime: raw?.visitTime ?? raw?.VisitTime ?? '',
    totalAmount: raw?.totalAmount ?? raw?.TotalAmount ?? 0,
    receivedAmount: raw?.receivedAmount ?? raw?.ReceivedAmount ?? 0,
    balance: raw?.balance ?? raw?.Balance ?? 0
  };
}

function mapTreatment(raw: any): PatientTreatment {
  return {
    id: raw?.id ?? raw?.Id ?? 0,
    patientVisitId: raw?.patientVisitId ?? raw?.PatientVisitId ?? 0,
    doctorComment: raw?.doctorComment ?? raw?.DoctorComment,
    patientFeedback: raw?.patientFeedback ?? raw?.PatientFeedback,
    allergies: raw?.allergies ?? raw?.Allergies,
    mapXray: raw?.mapXray ?? raw?.MapXray,
    mapPrescription: raw?.mapPrescription ?? raw?.MapPrescription,
    treatments: raw?.treatments ?? raw?.Treatments
  };
}

@Injectable({
  providedIn: 'root',
})
export class PatientVisitService {
  private readonly baseUrl = API_CONFIG.baseUrl;

  constructor(private http: HttpClient) {}

  getPatientVisits(): Observable<PatientVisit[]> {
    return this.http.get<any>(`${this.baseUrl}${API_CONFIG.endpoints.patientVisits}`).pipe(
      map((response) => {
        const list = Array.isArray(response) ? response : (response?.data ?? response?.value ?? []);
        return (list ?? []).map(mapPatientVisit);
      })
    );
  }

  getPatientVisitsPaged(pageNumber: number, pageSize: number, patientId?: number | null): Observable<PagedVisitResponse> {
    let url = `${this.baseUrl}${API_CONFIG.endpoints.patientVisitsPaged}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (patientId != null && patientId > 0) {
      url += `&patientId=${patientId}`;
    }
    return this.http.get<any>(url).pipe(
      map((response) => {
        const list = response?.patientVisit ?? response?.PatientVisit ?? [];
        return {
          patientVisit: (list ?? []).map(mapPatientVisit),
          totalCount: response?.totalCount ?? response?.TotalCount ?? 0,
          pageNumber: response?.pageNumber ?? response?.PageNumber ?? pageNumber,
          pageSize: response?.pageSize ?? response?.PageSize ?? pageSize,
          totalPages: response?.totalPages ?? response?.TotalPages ?? 1
        };
      })
    );
  }

  /** Get all treatments (used to filter by visit on frontend; backend has no GET by visitId) */
  getAllTreatments(): Observable<PatientTreatment[]> {
    return this.http.get<any>(`${this.baseUrl}${API_CONFIG.endpoints.patientTreatments}`).pipe(
      map((response) => {
        const list = Array.isArray(response) ? response : (response?.data ?? response?.value ?? []);
        return (list ?? []).map(mapTreatment);
      })
    );
  }
}
