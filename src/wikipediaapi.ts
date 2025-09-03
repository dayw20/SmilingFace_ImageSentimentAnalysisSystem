import jsdom from 'jsdom'
import { ImageURL, JobStatus, Topic } from './jobdata.js'
import { Connections } from './connections.js'

interface WikipediaAPI {
  /**
  * Returns an array of image links from Wikipedia pages that link to the given topic.
  * @param topic - The topic to search for.
  * @returns An array of image links.
  */
  getImageLinksFromPagesThatLinkTo: (topic: Topic, status: JobStatus) => Promise<Array<[Topic, ImageURL]>>

  /**
  * Synchronously retrieves image links from a Wikipedia topic.
  * @param topic - The topic to retrieve image links from.
  * @returns An array of image links.
  */
  getImageLinksFromTopic: (topic: Topic, status: JobStatus) => Promise<Array<[Topic, ImageURL]>>
}

function newWikipediaAPI(connections: Connections): WikipediaAPI {
  // Emulate the browser's DOMParser
  const { JSDOM } = jsdom
  global.DOMParser = new JSDOM().window.DOMParser

  const API_ADDRESS = 'https://en.wikipedia.org/w/api.php'
  const API_TIMEOUT = 3000
  // Limit concurrent requests to 5
  const MAX_CONCURRENT_REQUESTS = 5
  let activeRequests = 0
  const requestQueue: Array<() => void> = []
  
  // Retry configuration
  const MAX_RETRIES = 3
  const RETRY_DELAY = 100 // ms

  /**
   * Acquires a slot for a request
   */
  function acquireRequestSlot(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (activeRequests < MAX_CONCURRENT_REQUESTS) {
        activeRequests++
        console.log(`Acquired Wikipedia request slot. Active: ${activeRequests}`)
        resolve()
      } else {
        console.log(`Queuing Wikipedia request. Active: ${activeRequests}, Queue: ${requestQueue.length}`)
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
      console.log(`Processing next queued Wikipedia request. Queue: ${requestQueue.length}`)
      if (next) next()
    } else {
      activeRequests--
      console.log(`Released Wikipedia request slot. Active: ${activeRequests}`)
    }
  }

  /**
  * Creates a Wikipedia API request URL for the given topic and extra parameters.
  * @param topic - The topic to search for on Wikipedia.
  * @param extraParams - Additional parameters to include in the API request.
  * @returns The URL for the Wikipedia API request.
  */
  function createRequest(topic: string, extraParams: { [key: string]: string }): string {
    let url = API_ADDRESS
    const encodedTopic = encodeURIComponent(topic.replace(' ', '_'))
    const params: { [key: string]: string } = {
      ...extraParams,
      action: 'query',
      format: 'json',
      titles: encodedTopic
    }
    url = url + '?origin=*'
    Object.keys(params).forEach(function(key: string) {
      url = `${url}&${key}=${params[key]}`
    })
    return url
  }

  /**
   * Makes an HTTP GET request with retries
   * @param url The URL to request
   * @param retries Number of retries left
   * @returns A promise that resolves to the result or rejects with an error
   */
  function httpGetWithRetry(url: string, retries = MAX_RETRIES): Promise<string> {
    return new Promise(async (resolve, reject) => {
      await acquireRequestSlot()
      
      connections.httpGet(url, API_TIMEOUT, async (result, error) => {
        if (error) {
          releaseRequestSlot()
          console.error(`Error fetching ${url}: ${error}`)
          
          if (retries > 0) {
            console.log(`Retrying fetch (${retries} retries left)...`)
            try {
              // Wait a bit before retrying
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
              const retryResult = await httpGetWithRetry(url, retries - 1)
              resolve(retryResult)
            } catch (retryError) {
              reject(retryError)
            }
          } else {
            reject(error)
          }
        } else {
          releaseRequestSlot()
          resolve(result as string)
        }
      })
    })
  }

  /**
   * Makes an HTTP GET request and returns the JSON result
   * @param url The URL to request
   * @returns A promise that resolves to the parsed JSON result
   */
  async function getJSONResult(url: string): Promise<any> {
    try {
      const result = await httpGetWithRetry(url)
      return JSON.parse(result)
    } catch (error) {
      console.error(`Failed to get or parse JSON from ${url}: ${error}`)
      throw error
    }
  }

  /**
  * Returns an array of topics that link to a given Wikipedia page.
  * @param topic - The title of the target Wikipedia page.
  * @returns A promise that resolves to an array of strings representing the titles of
  *   Wikipedia pages that link to the target page.
  */
  async function getTopicsThatLinkTo(topic: Topic): Promise<Topic[]> {
    console.log(`Getting topics that link to ${topic}`)
    const url = createRequest(topic, { prop: 'links', pllimit: '10' })
    console.log(url)
    
    try {
      const response = await getJSONResult(url)
      const pages: any = response.query.pages
      const page: any = Object.values(pages)[0]
      const topics: string[] = []
      
      if (page.links) {
        page.links.forEach((link: any) => {
          topics.push(link.title)
        })
      }
      
      console.log(`Found ${topics.length} topics that link to ${topic}`)
      return topics
    } catch (error) {
      console.error(`Error getting topics that link to ${topic}: ${error}`)
      throw error
    }
  }

  /**
  * Retrieves the Wikipedia page for a given topic.
  * @param topic - The topic to search for on Wikipedia.
  * @returns A promise that resolves to the parsed HTML document of the Wikipedia page.
  */
  async function getWikipediaPage(topic: string): Promise<Document> {
    console.log(`Getting Wikipedia page for ${topic}`)
    const encodedTopic = encodeURIComponent(topic.replace(' ', '_'))
    const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodedTopic}&prop=text&formatversion=2&format=json&origin=*`
    
    try {
      const parsed = await getJSONResult(url)
      console.log(`Got Wikipedia page for ${topic}`)
      const htmlDoc = new DOMParser().parseFromString(parsed.parse.text, 'text/html')
      return htmlDoc
    } catch (error) {
      console.error(`Error getting Wikipedia page for ${topic}: ${error}`)
      throw error
    }
  }

  /**
   * Returns an array of image links from the Wikipedia page of the given topic.
   * @param htmlDoc - The wikipedia page.
   * @returns An array of image links from the Wikipedia page of the given topic.
   */
  function getImageLinks(htmlDoc: Document): string[] {
    // Get all images that are at least 100px wide
    const imageElements = htmlDoc.getElementsByTagName('img')
    const images: string[] = []
    for (let i = 0; i < imageElements.length; i++) {
      const attributes = imageElements[i].attributes
      // slice() removes the escaped quotes from the string
      let src = attributes.getNamedItem('src')?.value ?? ''
      if (src !== '') {
        if (src.startsWith('//')) {
          src = `https:${src}`
        }
        console.log(src)
        const width = attributes.getNamedItem('width')?.value ?? ''
        if (width !== '' && parseInt(width) > 100) {
          images.push(src)
        }
      }
    }
    console.log(`found ${images.length} images`)
    return images
  }

  /**
   * Retrieves image links from a Wikipedia topic.
   * @param topic - The topic to retrieve image links from.
   * @param status A JobStatus object to update the status of the job and track progress
   * @returns A promise that resolves to an array of pairs of topic and image link.
   */
  async function getImageLinksFromTopic(topic: Topic, status: JobStatus): Promise<Array<[Topic, ImageURL]>> {
    console.log(`Getting image links for ${topic}`)
    status.addTodo(1)
    
    try {
      const document = await getWikipediaPage(topic)
      status.step()
      const images = getImageLinks(document)
      return images.map(i => [topic, i])
    } catch (error) {
      console.error(`Error getting image links for ${topic}: ${error}`)
      status.step() // Still mark as processed even if there was an error
      throw error // Re-throw the error so it's caught by the caller
    }
  }

  /**
   * Returns an array of image links from Wikipedia pages that link to the given topic.
   * @param topic - The topic to search for.
   * @param status A JobStatus object to update the status of the job and track progress
   * @returns A promise that resolves to an array of pairs of topic and image link.
   */
  async function getImageLinksFromPagesThatLinkTo(topic: Topic, status: JobStatus): Promise<Array<[Topic, ImageURL]>> {
    try {
      const topics = await getTopicsThatLinkTo(topic)
      
      // Process all topics concurrently to maximize parallel requests
      // Let the queue mechanism handle limiting concurrent requests
      const imagePromises = topics.map(t => getImageLinksFromTopic(t, status))
      const results = await Promise.all(imagePromises)
      
      // Flatten the results
      return results.flat()
    } catch (error) {
      console.error(`Error getting image links from pages that link to ${topic}: ${error}`)
      throw error
    }
  }

  return {
    getImageLinksFromTopic,
    getImageLinksFromPagesThatLinkTo
  }
}

export { newWikipediaAPI, WikipediaAPI }