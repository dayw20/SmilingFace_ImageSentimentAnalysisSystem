import express from 'express'
import {newVisionAPI} from './visionapi.js'
import {JobData, JobStatus} from './jobdata.js'
import bodyParser from 'body-parser'
import {Connections} from './connections.js'
import {newWikipediaAPI} from './wikipediaapi.js'
import {v4} from 'uuid'

function smilingFacesBackend(connections: Connections): express.Express {
    const app = express()

    // this call tells express to serve all the static pages from the frontend/build folder at /
    app.use(express.static('frontend/build'))

    const noTopicNameError = new JobStatus(v4()).setError('No topic provided')

    const status = new Map<string, JobData>()
    const wikipediaAPI = newWikipediaAPI(connections)
    const visionAPI = newVisionAPI(connections)

    /**
     * API to create a new job.
     * Receives a JSON object with the topic name and whether to include neighbors.
     */
    app.post('/job', bodyParser.json(), (req, res) => {
        console.log('job request received')
        // console.log(req.body)
        if (!req?.body?.name) {
            res.status(400).send(JSON.stringify(noTopicNameError))
        } else {
            const jobData: JobStatus = new JobStatus(v4())

            const topic: string = req.body.name
            const withNeighbors: boolean = req.body.withNeighbors
            try {
                const imageLinks = wikipediaAPI.getImageLinksFromTopic(topic, jobData)
                if (withNeighbors) {
                    imageLinks.push(...wikipediaAPI.getImageLinksFromPagesThatLinkTo(topic, jobData))
                }

                visionAPI.detectAllFaces(imageLinks, jobData)

                status.set(jobData.id, jobData)

                console.log(`job ${jobData.id} done`)
                jobData.done = true
            } catch (error) {
                if (error instanceof Error) jobData.error = error.message; else jobData.error = String(error)
                console.error(error)
            }
            res.status(jobData.error ? 500 : 202).send(JSON.stringify(jobData))
        }
    })

    /**
     * returns the status of a specific job.
     * completed jobs are deleted after returning the status
     */
    app.get('/job/:id', (req, res) => {
        const jobId = req.params.id
        const jobStatus: JobData | undefined = status.get(jobId)

        if (jobStatus != null) res.send(JSON.stringify(jobStatus))
        else res.status(404).send(`{"error": "Job ${jobId} not found"}`)

        if (jobStatus?.done) status.delete(jobId)
    })

    return app
}

export {smilingFacesBackend}
