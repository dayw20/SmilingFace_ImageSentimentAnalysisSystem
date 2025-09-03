import { protos } from '@google-cloud/vision'
import { FaceFeelings, FaceLikelihood, ImageURL, JobStatus, Topic } from './jobdata.js'
import { Connections } from './connections.js'

export interface VisionAPI {
  /**
  * Detects all faces in the given images using Google Cloud Vision API.
  * @param images An array of image file paths to detect faces from.
  * @returns An array of FaceInfo objects, each containing the detected face annotations and the URL of the image.
  * @throws An error if the call failed.
  */
  detectAllFaces: (images: Array<[Topic, ImageURL]>, status: JobStatus) => Promise<FaceFeelings[]>
}

export function newVisionAPI(connections: Connections): VisionAPI {
  type FaceAnnotation = protos.google.cloud.vision.v1.IFaceAnnotation
  type FaceAnnotations = FaceAnnotation[] | undefined | null

  const API_TIMEOUT = 5000
  // Limit concurrent requests to 5
  const MAX_CONCURRENT_REQUESTS = 5
  let activeRequests = 0
  const requestQueue: Array<() => void> = []

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
   * Acquires a slot for a request
   */
  function acquireRequestSlot(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (activeRequests < MAX_CONCURRENT_REQUESTS) {
        activeRequests++
        console.log(`Acquired Vision request slot. Active: ${activeRequests}`)
        resolve()
      } else {
        console.log(`Queuing Vision request. Active: ${activeRequests}, Queue: ${requestQueue.length}`)
        requestQueue.push(resolve)
      }
    })
  }

  /**
   * Releases a request slot and processes the next queued request
   */
  function releaseRequestSlot(): void {
    if (requestQueue.length > 0) {
      const next = requestQueue.shift()
      console.log(`Processing next queued Vision request. Queue: ${requestQueue.length}`)
      if (next) next()
    } else {
      activeRequests--
      console.log(`Released Vision request slot. Active: ${activeRequests}`)
    }
  }

  /**
   * Detect faces in an image file using Google Cloud Vision API.
   * @param filename An image URL to detect faces from.
   * @returns A promise that resolves to an array of face feelings
   */
  function detectFaces(filename: ImageURL): Promise<FaceFeelings[]> {
    return new Promise(async (resolve) => {
      await acquireRequestSlot()
      
      try {
        console.log(`Detecting faces in ${filename}`)
        
        connections.detectFaces(filename, API_TIMEOUT, (faces, error) => {
          releaseRequestSlot()
          
          if (error) {
            console.error(`Error detecting faces in ${filename}: ${error}`)
            resolve([])
            return
          }
          
          console.log(`Found ${faces?.length ?? 0} faces`)
          const feelings = (faces != null)
            ? faces.map(face => {
              return {
                joyLikelihood: convertLikelihood(face.joyLikelihood),
                sorrowLikelihood: convertLikelihood(face.sorrowLikelihood),
                angerLikelihood: convertLikelihood(face.angerLikelihood),
                surpriseLikelihood: convertLikelihood(face.surpriseLikelihood)
              }
            })
            : []
          
          resolve(feelings)
        })
      } catch (error) {
        releaseRequestSlot()
        console.error(`Error detecting faces in ${filename}: ${error}`)
        resolve([])
      }
    })
  }

  /**
   * Detects all faces in the given images using Google Cloud Vision API.
   * @param images An array of image file paths to detect faces from.
   * @param status A JobStatus object to update the status of the job
   * @returns A promise that resolves to an array of face feelings
   */
  async function detectAllFaces(images: Array<[Topic, ImageURL]>, status: JobStatus): Promise<FaceFeelings[]> {
    status.addTodo(images.length)
    
    // Process images in batches to control concurrency while still being fast
    const allFeelings: FaceFeelings[] = []
    
    // Process images in parallel, but let the concurrency mechanism handle limits
    const promises = images.map(async ([topic, imageUrl]) => {
      try {
        const feelings = await detectFaces(imageUrl)
        status.addImage(topic, imageUrl, feelings)
        status.step()
        return feelings
      } catch (error) {
        console.error(`Error processing image ${imageUrl}: ${error}`)
        status.step() // Still mark as processed even if there was an error
        return [] as FaceFeelings[]
      }
    })
    
    // Wait for all images to be processed
    const results = await Promise.all(promises)
    
    // Collect all feelings
    results.forEach(feelings => {
      allFeelings.push(...feelings)
    })
    
    return allFeelings
  }

  return {
    detectAllFaces
  }
}