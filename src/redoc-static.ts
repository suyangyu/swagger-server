import { changeExtensionToHtml, getResources } from './resources'
import { execSync } from 'child_process'

getResources().forEach(
    filename => {
        const scriptCommand = `npx @redocly/cli build-docs resources/${filename} -o static/${changeExtensionToHtml(filename)}.html`
        console.log(scriptCommand)
        execSync(scriptCommand)
    }
)

