import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface PatientTreatmentMasterItem {
  id: number;
  patientId: number | null;
  treatmentId: number | null;
  treatmentName: string;
  startDate: string;
  endDate: string;
  totalAmountOfTreatment: number | null;
  amountPaidByPatient: number | null;
  balanceDue: number | null;
  label: string;
  closeTreatment: boolean | null;
  treatmentHasImage: boolean;
}

function mapPatientTreatmentMaster(raw: any): PatientTreatmentMasterItem {
  return {
    id: raw?.id ?? raw?.Id ?? 0,
    patientId: raw?.patientId ?? raw?.PatientId ?? null,
    treatmentId: raw?.treatmentId ?? raw?.TreatmentId ?? null,
    treatmentName: raw?.treatmentName ?? raw?.TreatmentName ?? '',
    startDate: raw?.startDate ?? raw?.StartDate ?? '',
    endDate: raw?.endDate ?? raw?.EndDate ?? '',
    totalAmountOfTreatment: raw?.totalAmountOfTreatment ?? raw?.TotalAmountOfTreatment ?? null,
    amountPaidByPatient: raw?.amountPaidByPatient ?? raw?.AmountPaidByPatient ?? null,
    balanceDue: raw?.balanceDue ?? raw?.BalanceDue ?? null,
    label: raw?.label ?? raw?.Label ?? '',
    closeTreatment: raw?.closeTreatment ?? raw?.CloseTreatment ?? null,
    treatmentHasImage: raw?.treatmentHasImage ?? raw?.TreatmentHasImage ?? false
  };
}

@Injectable({
  providedIn: 'root'
})
export class PatientTreatmentMasterService {
  private readonly baseUrl = API_CONFIG.baseUrl;

  constructor(private http: HttpClient) {}

  getByPatientId(patientId: number): Observable<PatientTreatmentMasterItem[]> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.patientTreatmentMasterByPatient}?patientId=${patientId}`;
    return this.http.get<any>(url).pipe(
      map((response) => {
        const list = Array.isArray(response) ? response : (response?.data ?? response?.value ?? []);
        return (list ?? []).map(mapPatientTreatmentMaster);
      })
    );
  }
}
