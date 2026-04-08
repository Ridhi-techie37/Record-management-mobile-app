import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface Attendance {
  id: number;
  empId: number;
  empName: string;
  date: string;
  punchInTime: string;
  punchOutTime?: string;
}

function mapAttendanceItem(raw: any): Attendance {
  return {
    id: raw?.id ?? raw?.Id ?? 0,
    empId: raw?.empId ?? raw?.EmpId ?? 0,
    empName: raw?.empName ?? raw?.EmpName ?? '',
    date: raw?.date ?? raw?.Date ?? '',
    punchInTime: raw?.punchInTime ?? raw?.PunchInTime ?? '',
    punchOutTime: raw?.punchOutTime ?? raw?.PunchOutTime ?? undefined
  };
}

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private readonly baseUrl = API_CONFIG.baseUrl;

  constructor(private http: HttpClient) {}

  getAttendance(): Observable<Attendance[]> {
    return this.http.get<any>(`${this.baseUrl}${API_CONFIG.endpoints.attendance}`).pipe(
      map((response) => {
        const list = Array.isArray(response) ? response : (response?.data ?? response?.value ?? []);
        return (list ?? []).map(mapAttendanceItem);
      })
    );
  }
}
