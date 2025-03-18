import {smilingFacesBackend} from './backend.js'
import {DefaultConnections} from './defaultconnections.js'

const app = smilingFacesBackend(new DefaultConnections())

const port = 8080

// Start the server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`)
})
