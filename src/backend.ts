import express from 'express'
import { newVisionAPI } from './visionapi.js'
import { JobData, JobStatus } from './jobdata.js'
import bodyParser from 'body-parser'
import { Connections } from './connections.js'
import { newWikipediaAPI } from './wikipediaapi.js'
import { v4 } from 'uuid'

function smilingFacesBackend (connections: Connections): express.Express {
  const app = express()

  // this call tells express to serve all the static pages from the frontend/build folder at /
  app.use(express.static('frontend/build'))

  const noTopicNameError = new JobStatus(v4()).setError('No topic provided')
  const tooManyJobsError = new JobStatus(v4()).setError('Too many jobs running. Please try again later.')

  const status = new Map<string, JobData>()
  const wikipediaAPI = newWikipediaAPI(connections)
  const visionAPI = newVisionAPI(connections)

  const MAX_CONCURRENT_JOBS = 5
  let activeJobs = 0

  /**
  * API to create a new job.
  * Receives a JSON object with the topic name and whether to include neighbors.
  */
  app.post('/job', bodyParser.json(), (req, res) => {
    console.log('job request received')
    if (!req?.body?.name) {
      res.status(400).send(JSON.stringify(noTopicNameError))
      return
    }
    if (activeJobs >= MAX_CONCURRENT_JOBS) {
      res.status(503).send(JSON.stringify(tooManyJobsError))
      return
    }
    const jobData = new JobStatus(v4())
    const topic: string = req.body.name
    const withNeighbors: boolean = req.body.withNeighbors
    status.set(jobData.id, jobData)
    activeJobs++

    // Process the job asynchronously
    processJob(topic, withNeighbors, jobData)
      .catch(error => {
        console.error(`Job ${jobData.id} failed:`, error)
        if (error instanceof Error) {
          jobData.error = error.message
        } else {
          jobData.error = String(error)
        }
      })
      .finally(() => {
        jobData.done = true
        activeJobs--
        console.log(`Job ${jobData.id} completed, active jobs: ${activeJobs}`)
      })

    // Return job ID immediately
    res.status(202).send(JSON.stringify(jobData))
  })

  /**
   * Helper function to sleep for the specified milliseconds
   */
  function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Process a job asynchronously
   */
  async function processJob (topic: string, withNeighbors: boolean, jobData: JobStatus): Promise<void> {
    try {
      console.log(`Processing job ${jobData.id} for topic ${topic}`)
      
      // Get image links from the main topic
      const imageLinks = await wikipediaAPI.getImageLinksFromTopic(topic, jobData)
      
      // Immediately start processing main images
      const processingMainImages = imageLinks.length > 0
      const mainImagesPromise = processingMainImages
        ? visionAPI.detectAllFaces(imageLinks, jobData)
        : Promise.resolve([])

      // Ensure main images start processing before neighbor images for optimal performance
      if (processingMainImages) {
        await sleep(20) // Small delay to prioritize main image processing
      }

      // Now get images from neighboring topics if requested
      let neighborImages: Array<[string, string]> = []
      if (withNeighbors) {
        try {
          neighborImages = await wikipediaAPI.getImageLinksFromPagesThatLinkTo(topic, jobData)

          // Process neighbor images if we have any
          if (neighborImages.length > 0) {
            await visionAPI.detectAllFaces(neighborImages, jobData)
          }
        } catch (neighborError) {
          console.error(`Error processing neighbor images for ${topic}:`, neighborError)
          // We don't re-throw this error as we want to still wait for main images to complete
        }
      }
      
      // Wait for main images to complete processing
      await mainImagesPromise
      
      console.log(`Job ${jobData.id} for topic ${topic} completed successfully`)
    } catch (error) {
      console.error(`Error processing job ${jobData.id}:`, error)
      throw error // Re-throw so it's caught by the caller
    }
  }

  /**
  * returns the status of a specific job.
  * completed jobs are deleted after returning the status
  */
  app.get('/job/:id', (req, res) => {
    const jobId = req.params.id
    const jobStatus: JobData | undefined = status.get(jobId)

    if (jobStatus != null) {
      res.send(JSON.stringify(jobStatus))
      
      // Clean up completed jobs
      if (jobStatus?.done) {
        status.delete(jobId)
      }
    } else {
      res.status(404).send(`{"error": "Job ${jobId} not found"}`)
    }
  })

  return app
}

export { smilingFacesBackend }