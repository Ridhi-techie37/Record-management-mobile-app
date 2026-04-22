/**
 * API base URL:
 * - Browser and mobile builds: use live backend directly.
 */
function getBaseUrl(): string {
  return 'https://hammerhead-app-ogh8y.ondigitalocean.app';
}

export const API_CONFIG = {
  get baseUrl() {
    return getBaseUrl();
  },
  endpoints: {
    login: '/api/Auth/login',
    patientLogin: '/api/Auth/patient-login',
    employees: '/api/Employee',
    departments: '/api/Department',
    attendance: '/api/EmployeeAttendance',
    patients: '/api/Patient',
    patientsPaged: '/api/Patient/paged',
    patientVisits: '/api/PatientVisit',
    patientVisitsPaged: '/api/PatientVisit/paged',
    patientTreatments: '/api/PatientTreatment',
    patientTreatmentMasterByPatient: '/api/PatientTreatmentMaster/by-patient',
    smileScans: '/api/v1/smile-scans'
  }
};
