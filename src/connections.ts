import {protos} from '@google-cloud/vision'

type GoogleFaceAnnotation = protos.google.cloud.vision.v1.IFaceAnnotation
export type GoogleFaceAnnotations = GoogleFaceAnnotation[] | undefined | null

/**
 * This file contains functions to perform web requests and call the Google Visions API.
 * It provides both asynchronous and synchronous versions of the functions.
 *
 * Neither this interface, the default implementation, nor the obfuscated file should be modified
 */
export interface Connections {

    /**
     * Makes an HTTP GET request to the specified URL and returns the response body as a string.
     * If the request fails, it returns an error with the reason for the failure.
     * @param url The URL to make the GET request to.
     * @param timeout The maximum time in milliseconds to wait for the request to complete.
     * @param callback A callback function that is called either with the result of the call or an error if the call failed.
     */
    httpGet: (url: string, timeout: number, callback: (result?: string, error?: Error) => void) => void

    /**
     * Detect faces in an image file using Google Cloud Vision API.
     * @param images An array of image file paths to detect faces from.
     * @param timeout The maximum time in milliseconds to wait for the request to complete.
     * @param callback A callback function that is called either with the result in the form of Google's FaceAnnotation object or an error if the call failed.
     */
    detectFaces: (imageUrl: string, timeout: number, callback: (result?: GoogleFaceAnnotations, error?: Error) => void) => void

    /**
     * Makes an HTTP GET request to the specified URL and returns the response body as a string.
     * If the request fails, it throws an error with the reason for the failure.
     *
     * @param url The URL to make the GET request to.
     * @param timeout The maximum time in milliseconds to wait for the request to complete -- ignored by this implementation
     * @returns The content of the page or throws an error if the request failed or timed out
     */
    syncHttpGet: (url: string, timeout: number) => string

    /**
     * Detect faces in an image file using Google Cloud Vision API.
     *
     * @param images An array of image file paths to detect faces from.
     * @param timeout The maximum time in milliseconds to wait for the request to complete -- ignored by this implementation
     * @returns The Google's FaceAnnotation object or throws an error if the call failed.
     */
    syncDetectFaces: (imageUrl: string, timeout: number) => GoogleFaceAnnotations

}
