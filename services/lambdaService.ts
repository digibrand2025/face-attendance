import axios from 'axios';
import * as ImageManipulator from 'expo-image-manipulator';
import { Config } from '../constants/Config';
import { EnrollResponse, RecognizeResponse, ListFacesResponse } from '../types';

/**
 * Service to interact with AWS Lambda functions for Rekognition
 */

// Helper to compress and convert image to base64
const compressImageToBase64 = async (imageUri: string): Promise<string> => {
    try {
        console.log('Compressing image...');
        const manipResult = await ImageManipulator.manipulateAsync(
            imageUri,
            [{ resize: { width: 800 } }], // Resize to max 800px width
            {
                compress: 0.7,
                format: ImageManipulator.SaveFormat.JPEG,
                base64: true
            }
        );

        const base64 = manipResult.base64 || '';
        console.log(`Compressed image size: ${base64.length} characters (~${Math.round(base64.length * 0.75 / 1024)}KB)`);

        return base64;
    } catch (error) {
        console.error('Image compression error:', error);
        throw new Error('Failed to process image');
    }
};

// Helper to clean base64 string (remove data URI prefix if present)
const cleanBase64 = (base64Image: string): string => {
    if (base64Image.includes('base64,')) {
        return base64Image.split('base64,')[1];
    }
    return base64Image.replace(/(\r\n|\n|\r)/gm, '');
};

// Retry helper with exponential backoff
const retryRequest = async <T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
): Promise<T> => {
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await requestFn();
        } catch (error: any) {
            lastError = error;

            // Don't retry on client errors (400-499)
            if (error.response?.status >= 400 && error.response?.status < 500) {
                throw error;
            }

            // Don't retry on last attempt
            if (attempt < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, attempt);
                console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
};

export const enrollStudent = async (
    imageUri: string,
    studentId: string,
    studentName: string
): Promise<EnrollResponse> => {
    try {
        // Compress image first
        const base64Image = await compressImageToBase64(imageUri);
        const imagePayload = cleanBase64(base64Image);

        console.log(`Attempting enrollment for ${studentId} (${studentName})`);
        console.log(`Image payload size: ${imagePayload.length} characters`);

        const response = await retryRequest(() =>
            axios.post(Config.LAMBDA_URLS.ENROLL_STUDENT, {
                image: imagePayload,
                studentId,
                studentName
            }, {
                timeout: Config.REQUEST_TIMEOUT,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        );

        console.log(`Enroll Success: Status ${response.status}`, response.data);
        return response.data;

    } catch (error: any) {
        console.error('Enroll Error Details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers
        });

        // Return structured error response
        return {
            success: false,
            message: error.response?.data?.error || error.response?.data?.message || `Enrollment failed: ${error.message}`,
            error: error.response?.data?.error || error.message
        };
    }
};

export const recognizeFace = async (
    imageUri: string
): Promise<RecognizeResponse> => {
    try {
        // Compress image first
        const base64Image = await compressImageToBase64(imageUri);
        const imagePayload = cleanBase64(base64Image);

        console.log(`Attempting recognition. Payload size: ${imagePayload.length} chars`);

        const response = await retryRequest(() =>
            axios.post(Config.LAMBDA_URLS.RECOGNIZE_FACE, {
                image: imagePayload
            }, {
                timeout: Config.REQUEST_TIMEOUT,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        );

        console.log(`Recognition Success: Status ${response.status}`, response.data);
        return response.data;

    } catch (error: any) {
        console.error('Recognition Error Details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers
        });

        // Return structured error response
        return {
            success: false,
            recognized: false,
            message: error.response?.data?.message || 'Failed to recognize face',
            error: error.response?.data?.error || error.message
        };
    }
};

export const createCollection = async (): Promise<{ success: boolean; message: string }> => {
    try {
        console.log('Creating Rekognition collection...');

        const response = await axios.post(
            Config.LAMBDA_URLS.CREATE_COLLECTION,
            {},
            {
                timeout: Config.REQUEST_TIMEOUT,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Collection created:', response.data);
        return response.data;

    } catch (error: any) {
        console.error('Create Collection Error:', error.response?.data || error.message);
        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Failed to create collection'
        };
    }
};

export const testLambdaConnection = async (): Promise<boolean> => {
    try {
        console.log('Testing Lambda connection...');

        // Test with a simple OPTIONS request or GET to check connectivity
        await axios.get(Config.LAMBDA_URLS.RECOGNIZE_FACE, {
            timeout: 5000,
            validateStatus: () => true // Accept any status code
        });

        console.log('Lambda connection: OK');
        return true;

    } catch (error: any) {
        console.error('Lambda connection failed:', error.message);
        return false;
    }
};

export const listEnrolledFaces = async (): Promise<ListFacesResponse> => {
    try {
        console.log('Fetching enrolled faces from collection...');

        const response = await axios.get(Config.LAMBDA_URLS.LIST_FACES, {
            timeout: Config.REQUEST_TIMEOUT,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log(`Fetched ${response.data.totalFaces} enrolled faces`);
        return response.data;

    } catch (error: any) {
        console.error('List Faces Error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });

        return {
            success: false,
            totalFaces: 0,
            faces: [],
            collectionId: '',
            region: '',
            error: error.response?.data?.error || error.message || 'Failed to fetch enrolled faces'
        };
    }
};