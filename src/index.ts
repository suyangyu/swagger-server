import express from 'express'
import swaggerUi from 'swagger-ui-express'
import redoc from'redoc-express'
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
                `${acc}<li>${fileName} <a href="raw/${fileName}">raw</a> <a href="swagger-ui/${fileName}">swagger ui</a> <a href="redoc/${fileName}">redoc</a></li>
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

app.use('/swagger-ui/:file', swaggerUi.serve, (req: any, res: any, err: any) => {
    const fileName = req.params.file
    const file = fs.readFileSync(`resources/${fileName}`, 'utf8')
    const swaggerDocument =
        fileName.endsWith('.yml') || fileName.endsWith('.yaml')
            ? yaml.parse(file)
            : file
    swaggerUi.setup(swaggerDocument)(req, res, err)
})

// serve your swagger.json file
app.get('/redoc/:file',  (req :any, res:any) => {
    const fileName = req.params.file
    redoc({
        title: 'API Docs',
        specUrl: `../raw/${fileName}`,
        nonce: '', // <= it is optional,we can omit this key and value
                   // we are now start supporting the redocOptions object
                   // you can omit the options object if you don't need it
                   // https://redocly.com/docs/api-reference-docs/configuration/functionality/
        redocOptions: {
        theme: {
            colors: {
                primary: {
                    main: '#6EC5AB'
                }
            },
            typography: {
                fontFamily: `"museo-sans", 'Helvetica Neue', Helvetica, Arial, sans-serif`,
                    fontSize: '15px',
                    lineHeight: '1.5',
                    code: {
                    code: '#87E8C7',
                        backgroundColor: '#4D4D4E'
                }
            },
            menu: {
                backgroundColor: '#ffffff'
            }
        }
        }
    })(req, res)
})


app.listen(port, () => {
    console.log(`App listening on port ${port}`)
    console.log(`http://localhost:${port}/`)
})
