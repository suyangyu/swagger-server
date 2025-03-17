import express from 'express'
import swaggerUi from 'swagger-ui-express'
import fs from 'fs'
import * as yaml from 'yaml'
import cors from 'cors'

const port = process.env.PORT || 8000

const app = express()

const supportedFileExtensions = ['yaml', 'yml', 'json']

const isSupported = (fileName: String) =>
    !!supportedFileExtensions.find(ext => fileName.endsWith(`.${ext}`))

app.get('/', function (req: any, res: any) {
    const files = fs.readdirSync("resources").reduce((acc: string, fileName: string) =>
            isSupported(fileName) ?
                `${acc}<li>${fileName} <a href="raw/${fileName}">raw</a> <a href="api-doc/${fileName}">swagger</a></li>
`
                : acc,
        ''
    )
    res.setHeader('Content-Type', 'text/html')
    res.send(`<!DOCTYPE html>
<html lang="en">
    <head><title>API Index</title></head>
    <body>
        <h1>APIs</h1>
        <ul>
            ${files}
        </ul>
    </body>
</html>
`)
})

app.use('/raw/:file', cors(), swaggerUi.serve, (req: any, res: any) => {
    const fileName = req.params.file
    const file = fs.readFileSync(`resources/${fileName}`, 'utf8')

    if (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) {
        res.setHeader('Content-Type', 'text/x-yaml')
    } else if (fileName.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json')
    } else {
        res.setHeader('Content-Type', 'text/plain')
    }
    res.send(file)
})

app.use('/api-doc/:file', swaggerUi.serve, (req: any, res: any, err: any) => {
    const fileName = req.params.file
    const file = fs.readFileSync(`resources/${fileName}`, 'utf8')
    const swaggerDocument =
        fileName.endsWith('.yml') || fileName.endsWith('.yaml')
            ? yaml.parse(file)
            : file
    swaggerUi.setup(swaggerDocument)(req, res, err)
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
    console.log(`http://localhost:${port}/`)
})
