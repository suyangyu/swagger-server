import fs from "fs";
import { isSupported } from './is-supported'

export const getDirectories = (source: string) =>
    fs.readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

export const getResources = (source?: string) =>
    fs.readdirSync(`resources${source? `/${source}`:''}`).filter((fileName: string)=> isSupported(fileName))

export const changeExtensionToHtml=
    (fileName: string) => fileName.replace(/\.[^.]+$/, '')
