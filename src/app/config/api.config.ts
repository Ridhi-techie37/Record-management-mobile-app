/**
 * API base URL:
 * - Browser (ng serve with proxy): '' = same origin, proxy forwards /api to backend
 * - Capacitor/Android emulator: 'http://10.0.2.2:51100' = direct to backend
 * Avoids mixed-content block (HTTPS page -> HTTP API) when using proxy.
 */
function getBaseUrl(): string {
  if (typeof window !== 'undefined' && (window as any).Capacitor) {
    return 'http://143.110.253.77:51100';
  }
  return '';
}

export const API_CONFIG = {
  get baseUrl() {
    return getBaseUrl();
  },
  endpoints: {
    login: '/api/Auth/login',
    employees: '/api/Employee',
    departments: '/api/Department',
    attendance: '/api/EmployeeAttendance',
    patients: '/api/Patient',
    patientsPaged: '/api/Patient/paged',
    patientVisits: '/api/PatientVisit',
    patientVisitsPaged: '/api/PatientVisit/paged',
    patientTreatments: '/api/PatientTreatment'
  }
};
