import {protos} from '@google-cloud/vision'
import {FaceFeelings, FaceLikelihood, ImageURL, JobStatus, Topic} from './jobdata.js'
// import pLimit from 'p-limit'
import {Connections} from './connections.js'

export interface VisionAPI {
    /**
     * Detects all faces in the given images using Google Cloud Vision API.
     * @param images An array of image file paths to detect faces from.
     * @returns An array of FaceInfo objects, each containing the detected face annotations and the URL of the image.
     * @throws An error if the call failed.
     */
    detectAllFaces: (images: Array<[Topic, ImageURL]>, status: JobStatus) => FaceFeelings[]

}

export function newVisionAPI(connections: Connections): VisionAPI {
    type FaceAnnotation = protos.google.cloud.vision.v1.IFaceAnnotation
    type FaceAnnotations = FaceAnnotation[] | undefined | null

    // Likelihood is an enum with these possible values:
    // VERY_LIKELY
    // LIKELY
    // POSSIBLE
    // UNLIKELY
    // VERY_UNLIKELY
    // UNKNOWN

    const API_TIMEOUT = 5000

    type GoogleLikelihood =
        protos.google.cloud.vision.v1.Likelihood
        | keyof typeof protos.google.cloud.vision.v1.Likelihood
        | null
        | undefined

    function convertLikelihood(googleLikelihood: GoogleLikelihood): FaceLikelihood {
        if (googleLikelihood === 'VERY_LIKELY') {
            return FaceLikelihood.VERY_LIKELY
        } else if (googleLikelihood === 'LIKELY') {
            return FaceLikelihood.LIKELY
        } else if (googleLikelihood === 'POSSIBLE') {
            return FaceLikelihood.POSSIBLE
        } else if (googleLikelihood === 'UNLIKELY') {
            return FaceLikelihood.UNLIKELY
        } else if (googleLikelihood === 'VERY_UNLIKELY') {
            return FaceLikelihood.VERY_UNLIKELY
        }
        return FaceLikelihood.UNKNOWN
    }

    /**
     * Detect faces in an image file using Google Cloud Vision API.
     * @param filename An image URL to detect faces from.
     * @returns An array of FaceInfo objects, each containing the detected face annotations and the URL of the image.
     * @throws An error if the call failed.
     */
    function detectFaces(filename: ImageURL): FaceFeelings[] {
        console.log(`Detecting faces in ${filename}`)
        const faces = connections.syncDetectFaces(filename, API_TIMEOUT)
        console.log(`Found ${faces?.length as number} faces`)
        return (faces != null) ?
            faces.map(face => {
                return {
                    joyLikelihood: convertLikelihood(face.joyLikelihood),
                    sorrowLikelihood: convertLikelihood(face.sorrowLikelihood),
                    angerLikelihood: convertLikelihood(face.angerLikelihood),
                    surpriseLikelihood: convertLikelihood(face.surpriseLikelihood)
                }
            }) : []
    }

    /**
     * Detects all faces in the given images using Google Cloud Vision API.
     * @param images An array of image file paths to detect faces from.
     * @param status A JobStatus object to update the status of the job and collect results incrementally
     * @returns An array of FaceFeelings objects, each containing the detected face annotations
     * @throws An error if anything fails
     */
    function detectAllFaces(images: Array<[Topic, ImageURL]>, status: JobStatus): FaceFeelings[] {
        status.addTodo(images.length)

        const allFeelings: FaceFeelings[] = []
        for (const image of images) {
            const feelings = detectFaces(image[1])
            status.addImage(image[0], image[1], feelings)
            status.step()
            allFeelings.push(...feelings)
        }
        return allFeelings
    }

    return {
        detectAllFaces
    }
}
