import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { useEffect, useState } from 'react'
import { JobData } from './jobdata.js'
import Dashboard from './Dashboard'

/**
 * configuration of backend API addresses
 */
const routes = {
  newJob: { address: '/job', method: 'post' },
  jobUpdatePrefix: '/job/'
}

/**
 * internal storage of jobs for the user interface
 * status represents data from the backend
 */
export interface JobInfo {
  topic: string
  withNeighbors: boolean
  status?: JobData
}

/** example jobs when the user interface starts */
const initialJobs: JobInfo[] = [
  { topic: 'Carnegie Mellon University', withNeighbors: false },
  { topic: 'David Tepper', withNeighbors: false }
]

function App (): JSX.Element {
  // state to track job info and which job is currently visible in the user interface
  const [jobInfos, setJobInfos] = useState<JobInfo[]>(initialJobs)
  const [currentJob, setCurrentJob] = useState<number>(0)

  // effect to update job status
  useEffect(() => {
    let timer: NodeJS.Timeout

    // function to poll the backend for job status
    function updateJobStatus (jobId: string): void {
      // console.log("updating job status for " + jobId)

      const jobIdx = currentJob
      fetch(routes.jobUpdatePrefix + jobId)
        .then(async response => {
          if (response.status === 404) throw new Error('request failed: ' + response)
          return await response.json()
        })
        .then(data => {
          newJobData(jobIdx, data)
        })
        .catch(error => {
          console.error(error)
          if (timer) clearTimeout(timer)
        })
    }

    // poll every second for not-finished jobs
    const c = jobInfos[currentJob]
    if (c && (c.status != null) && !c.status.done) {
      const id = c.status.id
      timer = setTimeout(() => updateJobStatus(id), 1000)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [jobInfos, currentJob])

  // function to start a new job, updating state and sending it to the backend
  function submitJob (name: string, withNeighbors: boolean, jobIdx: number): void {
    const formData = { name, withNeighbors }

    console.log(formData)

    const newJobInfos = jobInfos.slice()
    newJobInfos[jobIdx].topic = name
    newJobInfos[jobIdx].withNeighbors = withNeighbors
    setJobInfos(newJobInfos)

    fetch(routes.newJob.address, {
      method: routes.newJob.method,
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(async response =>
        await response.json())
      .then(data => {
        // console.log(data);
        // update local state, at least the internal job id and maybe some or all results
        newJobData(jobIdx, data)
      })
      .catch(error => {
        console.error(error)
      })
  }

  // update internal state with new job data from the backend
  function newJobData (jobIdx: number, job: JobData): void {
    console.log('setting job status')
    const newJobInfos = jobInfos.slice()
    newJobInfos[jobIdx].status = job
    if (job.error !== undefined || job.error !== "") {
      console.log(job.error)
    }
    setJobInfos(newJobInfos)
  }

  // create a new job in the frontend
  function newAnalysis (): void {
    const jobInfo: JobInfo = { topic: '', withNeighbors: false }
    const jobNr = jobInfos.length
    const newJobInfos = jobInfos.slice()
    newJobInfos.push(jobInfo)
    setJobInfos(newJobInfos)
    setCurrentJob(jobNr)
  }

  // switch jobs in the frontend
  function selectJob (idx: number): void {
    // console.log("selecting job " + idx)
    setCurrentJob(idx)
  }

  return <Dashboard submitNewJob={submitJob} jobInfos={jobInfos} currentJob={currentJob} selectJob={selectJob} newAnalysis={newAnalysis} />
}

export default App
