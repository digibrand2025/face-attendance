export interface Student {
  studentId: string;
  studentName: string;
  class?: string;
  instituteId?: string;
}

export interface EnrollResponse {
  success: boolean;
  message: string;
  faceId?: string;
  studentId?: string;
  error?: string;
}

export interface RecognizeResponse {
  success: boolean;
  recognized: boolean;
  studentId?: string;
  confidence?: number;
  message?: string;
  error?: string;
  faceId?: string;
}

export interface AttendanceResponse {
  success: boolean;
  message: string;
  attendanceId?: number;
  error?: string;
}
