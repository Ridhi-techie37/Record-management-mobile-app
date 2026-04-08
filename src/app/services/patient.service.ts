import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface Patient {
  patientId: number;
  name: string;
  phoneNumber1: string;
  address?: string;
  phoneNumber2?: string;
  age: number;
  dob: string;
  gender: string;
  email?: string;
  cardUid?: string;
}

function mapPatient(raw: any): Patient {
  return {
    patientId: raw?.patientId ?? raw?.PatientId ?? 0,
    name: raw?.name ?? raw?.Name ?? '',
    phoneNumber1: raw?.phoneNumber1 ?? raw?.PhoneNumber1 ?? '',
    address: raw?.address ?? raw?.Address,
    phoneNumber2: raw?.phoneNumber2 ?? raw?.PhoneNumber2,
    age: raw?.age ?? raw?.Age ?? 0,
    dob: raw?.dob ?? raw?.DOB ?? '',
    gender: raw?.gender ?? raw?.Gender ?? '',
    email: raw?.email ?? raw?.Email,
    cardUid: raw?.cardUid ?? raw?.CardUid
  };
}

/** Paged response from GET /api/Patient/paged */
export interface PagedPatientResponse {
  patientMasterData: Patient[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private readonly baseUrl = API_CONFIG.baseUrl;

  constructor(private http: HttpClient) {}

  getPatients(): Observable<Patient[]> {
    return this.http.get<any>(`${this.baseUrl}${API_CONFIG.endpoints.patients}`).pipe(
      map((response) => {
        const list = Array.isArray(response) ? response : (response?.data ?? response?.value ?? []);
        return (list ?? []).map(mapPatient);
      })
    );
  }

  getPatientsPaged(pageNumber: number, pageSize: number, search?: string | null): Observable<PagedPatientResponse> {
    let url = `${this.baseUrl}${API_CONFIG.endpoints.patientsPaged}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (search != null && search.trim() !== '') {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    return this.http.get<any>(url).pipe(
      map((response) => {
        const list = response?.patientMasterData ?? response?.PatientMasterData ?? [];
        return {
          patientMasterData: (list ?? []).map(mapPatient),
          totalCount: response?.totalCount ?? response?.TotalCount ?? 0
        };
      })
    );
  }
}
