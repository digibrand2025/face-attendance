import axios from 'axios';
import { Config } from '../constants/Config';

/**
 * Service to interact with PHP backend APIs
 */

// Define PHP API response types
export interface MarkAttendanceResponse {
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

export interface StudentDetailsResponse {
    success: boolean;
    student?: {
        id: string;
        name: string;
        photo_url: string;
        admission_no?: string;
        email?: string;
    };
    error?: string;
}

/**
 * Mark attendance in PHP database after face recognition
 */
export const markAttendance = async (
    studentId: string,
    confidence: number
): Promise<MarkAttendanceResponse> => {
    try {
        console.log(`Marking attendance for student ${studentId} with confidence ${confidence}%`);

        const response = await axios.post(
            Config.PHP_API.MARK_ATTENDANCE,
            {
                student_id: studentId,
                confidence: confidence
            },
            {
                timeout: Config.REQUEST_TIMEOUT,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Attendance marked successfully:', response.data);
        return response.data;

    } catch (error: any) {
        console.error('Mark Attendance Error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });

        return {
            success: false,
            message: error.response?.data?.error || 'Failed to mark attendance',
            error: error.response?.data?.error || error.message
        };
    }
};

/**
 * Get student photo URL
 */
export const getStudentPhotoUrl = (studentId: string): string => {
    return `${Config.PHP_API.BASE_URL}/public_download.php?student_id=${studentId}`;
};

/**
 * Bulk enroll students to AWS from PHP database
 */
export const bulkEnrollToAWS = async (
    studentIds: number[]
): Promise<any> => {
    try {
        console.log(`Bulk enrolling ${studentIds.length} students to AWS...`);

        const response = await axios.post(
            Config.PHP_API.ENROLL_TO_AWS,
            {
                student_ids: studentIds
            },
            {
                timeout: 60000, // 60 seconds for bulk operations
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Bulk enrollment result:', response.data);
        return response.data;

    } catch (error: any) {
        console.error('Bulk Enrollment Error:', error.response?.data || error.message);
        throw error;
    }
};
