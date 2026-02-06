import axios from 'axios';
import { Config } from '../constants/Config';
import { EnrollResponse, RecognizeResponse } from '../types';

/**
 * Service to interact with AWS Lambda functions for Rekognition
 */

// Helper to clean base64 string
const cleanBase64 = (base64Image: string) => {
    if (base64Image.includes(',')) {
        return base64Image.split(',')[1];
    }
    return base64Image;
};

export const enrollStudent = async (
    base64Image: string,
    studentId: string,
    studentName: string
): Promise<EnrollResponse> => {
    try {
        const imagePayload = cleanBase64(base64Image);
        console.log(`Attempting enrollment for ${studentId}. Image payload size: ${imagePayload.length} characters`);

        const response = await axios.post(Config.LAMBDA_URLS.ENROLL_STUDENT, {
            image: imagePayload,
            studentId,
            studentName
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log(`Enroll Response: Status ${response.status}`, response.data);
        return response.data;
    } catch (error: any) {
        console.error('Enroll Error Details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers
        });

        return {
            success: false,
            message: `Enrollment failed: ${error.message}`,
            error: JSON.stringify(error.response?.data || error.message)
        };
    }
};

export const recognizeFace = async (
    base64Image: string
): Promise<RecognizeResponse> => {
    try {
        // Sanitize: ensure no newlines and clean header
        const imagePayload = cleanBase64(base64Image).replace(/(\r\n|\n|\r)/gm, "");

        console.log(`Attempting recognition. Payload size: ${imagePayload.length} chars`);
        console.log(`Payload prefix: ${imagePayload.substring(0, 30)}...`);

        const response = await axios.post(Config.LAMBDA_URLS.RECOGNIZE_FACE, {
            image: imagePayload
        }, {
            timeout: Config.REQUEST_TIMEOUT,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log(`Recognition Response: Status ${response.status}`, JSON.stringify(response.data));
        return response.data;
    } catch (error: any) {
        console.error('Recognition Error Details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers
        });

        return {
            success: false,
            recognized: false,
            message: 'Failed to recognize face',
            error: error.message || 'Unknown error'
        };
    }
};

export const createCollection = async (): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await axios.post(Config.LAMBDA_URLS.CREATE_COLLECTION, {}, {
            timeout: Config.REQUEST_TIMEOUT
        });
        return response.data;
    } catch (error: any) {
        console.error('Create Collection Error:', error);
        return {
            success: false,
            message: error.message || 'Failed to create collection'
        };
    }
};

export const testLambdaConnection = async (): Promise<boolean> => {
    try {
        // Just testing if we can reach the endpoint, even if it returns 400/500 it means network is ok
        await axios.get(Config.LAMBDA_URLS.RECOGNIZE_FACE, { timeout: 5000 });
        return true;
    } catch (error) {
        return false;
    }
};
