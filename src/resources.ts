import fs from "fs";
import { isSupported } from './is-supported'

export const getResources = () =>
    fs.readdirSync("resources").filter((fileName: string)=> isSupported(fileName))

export const changeExtensionToHtml=
    (fileName: string) => fileName.replace(/\.[^.]+$/, '')
