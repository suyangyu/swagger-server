import { changeExtensionToHtml, getResources } from './resources'
import { execSync } from 'child_process'

const targets: string[] | [undefined] = (() => {
    const t = [... process.argv].splice(2)
    return t.length === 0 ? [undefined] : t
})()

console.log(`generating for ${targets.toString()}`)

targets.forEach(maybeFolder => {
    const folder = maybeFolder? `${maybeFolder}/`:''
    getResources(maybeFolder).forEach(
        filename => {
            const scriptCommand = `npx @redocly/cli build-docs resources/${folder}${filename} -o static/${folder}${changeExtensionToHtml(filename)}.html`
            console.log(scriptCommand)
            execSync(scriptCommand)
        }
    )
})
