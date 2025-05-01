import express from 'express'
import swaggerUi from 'swagger-ui-express'
import redoc from'redoc-express'
import fs from 'fs'
import * as yaml from 'yaml'
import cors from 'cors'
import { isSupported } from './is-supported'
import { changeExtensionToHtml } from "./resources";
import { execSync } from 'child_process'

const port = process.env.PORT || 8000
const app = express()

const indexHtml =  (folder?: string) => {
    const maybeFolder = folder? `/${folder}/`: ''
    const files = fs.readdirSync(`resources${maybeFolder}`).reduce((acc: string, fileName: string) =>
            isSupported(fileName) ?
                `${acc}<li>${fileName} <a href="${maybeFolder}raw/${fileName}">raw</a> <a href="${maybeFolder}swagger-ui/${fileName}">swagger ui</a> <a href="${maybeFolder}redoc/${fileName}">redoc</a> <a href="${maybeFolder}static-redoc/${changeExtensionToHtml(fileName)}">static redoc</a></li>
`
                : acc,
        ''
    )
        return `
<!DOCTYPE html>
<html lang="en">
    <head><title>API Index</title></head>
    <body>
        <h1>APIs</h1>
        <form action="/${ folder ? folder : '' }" method="post">
            <button onclick="this.innerHTML='Generating please wait...'; this.disabled=true; this.form.submit();">Generate static redocs</button>
       </form>
        <ul>
            ${files}
        </ul>
    </body>
</html>
`
}

const getIndex = (req: any, res: any) => {
    const maybeFolder = req.params.folder

    res.setHeader('Content-Type', 'text/html')
    res.send(indexHtml(maybeFolder))
}

app.get('/', getIndex)

app.get('/:folder', getIndex)

const generateStatic =  (req: any, res: any) => {
    const maybeFolderName = req.params.folder
    const folder = maybeFolderName ? `${maybeFolderName}/` : ''
    const scriptArg = folder ? ` ${folder}`: ''

    execSync(`npm run redoc:static${scriptArg}`)
    res.setHeader('Content-Type', 'text/html')
    res.send(indexHtml(folder))
}

app.post('/', generateStatic)

app.post('/:folder', generateStatic)

const getRawFile = (req: any, res: any) => {
    const fileName = req.params.file
    const maybeFolderName = req.params.folder
    const folder = maybeFolderName ? `${maybeFolderName}/` : ''
    const file = fs.readFileSync(`resources/${folder}${fileName}`, 'utf8')

    if (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) {
        res.setHeader('Content-Type', 'text/x-yaml')
    } else if (fileName.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json')
    } else {
        res.setHeader('Content-Type', 'text/plain')
    }
    res.send(file)
}

app.use('/raw/:file', cors(), swaggerUi.serve, getRawFile)

app.use('/:folder/raw/:file', cors(), swaggerUi.serve, getRawFile)

const getSwaggerUi =  (req: any, res: any, err: any) => {
    const fileName = req.params.file
    const maybeFolderName = req.params.folder
    const folder = maybeFolderName ? `${maybeFolderName}/` : ''

    const file = fs.readFileSync(`resources/${folder}${fileName}`, 'utf8')
    const swaggerDocument =
        fileName.endsWith('.yml') || fileName.endsWith('.yaml')
            ? yaml.parse(file)
            : file
    swaggerUi.setup(swaggerDocument)(req, res, err)
}

app.use('/swagger-ui/:file', swaggerUi.serve, getSwaggerUi)

app.use('/:folder/swagger-ui/:file', swaggerUi.serve, getSwaggerUi)

const getDynamicRedoc = (req :any, res:any) => {
    const fileName = req.params.file
    redoc({
        title: 'API Docs',
        specUrl: `../raw/${fileName}`,
        nonce: '', // <= it is optional,we can omit this key and value
                   // we are now start supporting the redocOptions object
                   // you can omit the options object if you don't need it
                   // https://redocly.com/docs/api-reference-docs/configuration/functionality/
        redocOptions: {
            // https://redocly.com/docs-legacy/api-reference-docs/configuration/theming
            theme: {
                spacing: {
                    sectionVertical: '35px',
                },
                typography: {
                    headings: {
                        lineHeight: "1.2em"
                    }
                }
            }
        }
    })(req, res)
}

app.get('/redoc/:file', getDynamicRedoc)

app.get('/:folder/redoc/:file', getDynamicRedoc)

const getStaticRedoc = (req: any, res: any) => {
    const fileName = req.params.file
    const maybeFolderName = req.params.folder
    const folder = maybeFolderName ? `${maybeFolderName}/` : ''
    const file = fs.readFileSync(`static/${folder}${fileName}.html`, 'utf8')

    res.send(file)
}

app.use('/static-redoc/:file', cors(), swaggerUi.serve, getStaticRedoc)

app.use('/:folder/static-redoc/:file', cors(), swaggerUi.serve, getStaticRedoc)

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
    console.log(`http://localhost:${port}/`)
})
