/*
 * Helper functions for React components.
 */

class Helpers {

    /**
     * filter files for specific file types
     * looks at the first n chars of the files *content*
     * returns only a list of file *names* (no contents)
     */
    static filterFilesByRegExp(files, regexp, n = 100) {
        let matchingFiles = []
        files.forEach(file => {

            // get first n chars of file (todo: maybe until line break?)
            const fileHead = (new TextDecoder).decode(file.bytes.subarray(0, n))

            // check if it matches -> save filename
            if(fileHead.match(new RegExp(regexp)) != null) matchingFiles.push(file.name)

        })
        return matchingFiles
    }

    // filter files for private keys -> return array of file names
    static getPrivateKeysFilenamesFromFiles(files) {
        return Helpers.filterFilesByRegExp(files, "^-----BEGIN.* PRIVATE KEY-----")
                                                //  -----BEGIN ENCRYPTED PRIVATE KEY-----
    }

    // filter files for private keys -> return array of file names
    static getPublicKeysFilenamesFromFiles(files) {
        return Helpers.filterFilesByRegExp(files, "^-----BEGIN.* PUBLIC KEY-----")
    }

    // filter files for ec param files -> return array of file names
    static getEllipticCurvesParamsFilenamesFromFiles(files) {
        return Helpers.filterFilesByRegExp(files, "^-----BEGIN EC PARAMETERS-----")
    }

    // check if some key seems to be encrypted -> return boolean
    static isKeyEncrypted(keyfile) { // keyfile => type object
        console.log("keyfile", keyfile)
        return Helpers.filterFilesByRegExp([keyfile], "ENCRYPTED").length > 0
    }

}

export default Helpers
