import axios from 'axios';
import { Config } from '../constants/Config';
import { AttendanceResponse, Student } from '../types';

/**
 * Service to interact with PHP Backend
 * Note: Endpoints are placeholders and need to be updated with actual server URL
 */

export const markAttendance = async (
    studentId: string,
    confidence: number,
    timestamp: string,
    instituteId: string
): Promise<AttendanceResponse> => {
    try {
        const response = await axios.post(Config.PHP_API.MARK_ATTENDANCE, {
            studentId,
            confidence,
            timestamp,
            instituteId
        }, {
            timeout: Config.REQUEST_TIMEOUT
        });

        return response.data;
    } catch (error: any) {
        console.error('Attendance Mark Error:', error);
        return {
            success: false,
            message: 'Failed to mark attendance',
            error: error.message || 'Unknown error'
        };
    }
};

export const getStudents = async (instituteId: string): Promise<Student[]> => {
    try {
        const response = await axios.get(`${Config.PHP_API.GET_STUDENTS}?instituteId=${instituteId}`, {
            timeout: Config.REQUEST_TIMEOUT
        });
        return response.data;
    } catch (error) {
        console.error('Get Students Error:', error);
        return [];
    }
};
