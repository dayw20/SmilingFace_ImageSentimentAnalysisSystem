import jsdom from 'jsdom'
import {ImageURL, JobStatus, Topic} from './jobdata.js'
import {Connections} from './connections.js'

interface WikipediaAPI {

    /**
     * Returns an array of image links from Wikipedia pages that link to the given topic.
     * @param topic - The topic to search for.
     * @returns An array of image links.
     */
    getImageLinksFromPagesThatLinkTo: (topic: Topic, status: JobStatus) => Array<[Topic, ImageURL]>

    /**
     * Synchronously retrieves image links from a Wikipedia topic.
     * @param topic - The topic to retrieve image links from.
     * @returns An array of image links.
     */
    getImageLinksFromTopic: (topic: Topic, status: JobStatus) => Array<[Topic, ImageURL]>

}

function newWikipediaAPI(connections: Connections): WikipediaAPI {
    // Emulate the brower's DOMParser
    const {JSDOM} = jsdom
    global.DOMParser = new JSDOM().window.DOMParser

    const API_ADDRESS = 'https://en.wikipedia.org/w/api.php'
    const API_TIMEOUT = 3000

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
        Object.keys(params).forEach(function (key: string) {
            url = `${url}&${key}=${params[key]}`
        })
        return url
    }

    function getJSONResult(url: string): any {
        const result = connections.syncHttpGet(url, API_TIMEOUT)
        return JSON.parse(result)
    }

    /**
     * Returns an array of topics that link to a given Wikipedia page.
     * @param topic - The title of the target Wikipedia page.
     * @returns An array of strings representing the titles of
     *   Wikipedia pages that link to the target page.
     * @throws An error if the call failed.
     */
    function getTopicsThatLinkTo(topic: Topic): Topic[] {
        console.log(`Getting topics that link to ${topic}`)
        const url = createRequest(topic, {prop: 'links', pllimit: '10'})
        console.log(url)
        const response = getJSONResult(url)
        const pages: any = response.query.pages
        const page: any = Object.values(pages)[0]
        const topics: string[] = []
        page.links.forEach((link: any) => {
            topics.push(link.title)
        })
        console.log(`Found ${topics.length} topics that link to ${topic}`)
        return topics
    }

    /**
     *  Retrieves the Wikipedia page for a given topic.
     *  @param topic - The topic to search for on Wikipedia.
     *  @returns The parsed HTML document of the Wikipedia page.
     */
    function getWikipediaPage(topic: string): Document {
        console.log(`Getting Wikipedia page for ${topic}`)
        const encodedTopic = encodeURIComponent(topic.replace(' ', '_'))
        const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodedTopic}&prop=text&formatversion=2&format=json&origin=*`
        const body = connections.syncHttpGet(url, API_TIMEOUT)
        console.log(`Got Wikipedia page for ${topic}`)
        const parsed = JSON.parse(body).parse
        return new DOMParser().parseFromString(parsed.text, 'text/html')
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
     * @returns An array of pairs of topic and image link.
     * @throws An error if the call failed.
     */
    function getImageLinksFromTopic(topic: Topic, status: JobStatus): Array<[Topic, ImageURL]> {
        console.log(`Getting image links for ${topic}`)
        status.addTodo(1)
        const document = getWikipediaPage(topic)
        status.step()
        const images = getImageLinks(document)
        return images.map(i => [topic, i])
    }

    /**
     * Returns an array of image links from Wikipedia pages that link to the given topic.
     * @param topic - The topic to search for.
     * @param status A JobStatus object to update the status of the job and track progress
     * @returns An array of pairs of topic and image link.
     * @throws An error if the call failed.
     */
    function getImageLinksFromPagesThatLinkTo(topic: Topic, status: JobStatus): Array<[Topic, ImageURL]> {
        const topics = getTopicsThatLinkTo(topic)
        const links = []
        for (const t of topics) {
            links.push(...getImageLinksFromTopic(t, status))
        }
        return links
    }

    return {
        getImageLinksFromTopic,
        getImageLinksFromPagesThatLinkTo
    }
}

export {newWikipediaAPI, WikipediaAPI}
