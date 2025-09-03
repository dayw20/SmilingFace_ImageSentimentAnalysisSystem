// type aliases for readability
export type Topic = string
export type ImageURL = string

/**
 * JobData is the data structure that is used to communicate the status of a job
 * between backend and frontend. Do not modify.
 */
export interface JobData {
  id: string
  done: boolean
  error?: string
  progress?: { done: number, total: number }
  data?: TopicInfo
}

export enum FaceLikelihood {
  UNKNOWN = 0,
  VERY_UNLIKELY = 1,
  UNLIKELY = 2,
  POSSIBLE = 3,
  LIKELY = 4,
  VERY_LIKELY = 5
}

/**
 * the vision API can detect four kinds of feelings
 */
export interface FaceFeelings {
  joyLikelihood: FaceLikelihood
  sorrowLikelihood: FaceLikelihood
  angerLikelihood: FaceLikelihood
  surpriseLikelihood: FaceLikelihood
}

/**
 * Map from imagesURLs to corresponding feelings detected,
 * one feeling per detected face
 */
export interface ImageInfo {
  [imageURL: ImageURL]: FaceFeelings[]
}

/**
 * Map from topics to corresponding image info
 */
export interface TopicInfo {
  [topic: Topic]: ImageInfo
}

/**
 * internal class to easily set and update jobdata.
 * This collects results of the job incrementally,
 * assigns a unique id to each job, and tracks progress
 */
export class JobStatus implements JobData {
  id: string
  done: boolean
  error?: string = undefined
  progress?: { done: number, total: number } = undefined
  data?: TopicInfo = undefined

  constructor (id: string) {
    this.id = id
    this.done = false
    this.error = undefined
    this.progress = undefined
  }

  /**
    * Mark that the job has failed with an error
    */
  setError (msg: string): JobStatus {
    this.error = msg
    this.done = true
    return this
  }

  /**
     * Mark that additional work as been identified as
     * left to be done
     * @param c The amount of additional work identified
     */
  addTodo (c: number): JobStatus {
    if (this.progress == null) this.progress = { done: 0, total: 0 }
    this.progress.total += c
    return this
  }

  /**
     * Mark one unit of work as completed.
     */
  step (): JobStatus {
    if (this.progress == null) this.progress = {done: 0, total: 0}
    this.progress.done++
    if (this.progress.done > this.progress.total) {
      this.progress.total = this.progress.done
    }
    return this
  }

  /**
     * Collect a partial analysis result of feelings identified
     * for a single image
     * @param topic Topic the image belongs to
     * @param imageURL URL of the image analyzed
     * @param feelings Feelings identified of each face in the image
     * @returns
     */
  addImage (topic: Topic, imageURL: ImageURL, feelings: FaceFeelings[]): JobStatus {
    if (this.data == null) this.data = {}
    if (!this.data[topic]) this.data[topic] = {}
    if (!this.data[topic][imageURL]) this.data[topic][imageURL] = []
    this.data[topic][imageURL] = feelings
    return this
  }
}
