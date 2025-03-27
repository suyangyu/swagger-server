const supportedFileExtensions = ['yaml', 'yml', 'json']

export const isSupported = (fileName: String) =>
    !!supportedFileExtensions.find(ext => fileName.endsWith(`.${ext}`))
