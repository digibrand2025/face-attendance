// Add to existing types
export interface Student {
  studentId: string;
  studentName: string;
  class?: string;
  instituteId?: string;
  photoUrl?: string;
  isPartTimeToday?: boolean;
  checkInTime?: string;
  admissionNo?: string;
  email?: string;
}

export interface AttendanceRecord {
  success: boolean;
  message: string;
  already_marked?: boolean;
  student?: {
    id: string;
    name: string;
    photo_url: string;
    is_part_time_today?: boolean;
    check_in_time?: string;
    confidence?: number;
    first_check_in?: string;
  };
  error?: string;
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

export interface EnrolledFace {
  studentId: string;
  faceId: string;
  confidence: number;
  imageId: string;
}

export interface ListFacesResponse {
  success: boolean;
  totalFaces: number;
  faces: EnrolledFace[];
  collectionId: string;
  region: string;
  error?: string;
}
