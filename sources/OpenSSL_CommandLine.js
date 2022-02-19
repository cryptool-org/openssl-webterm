import React from "react"

import { XTerm } from "xterm-for-react"
import EmscrWasmTerm from "emscr-wasm-term"

import OpenSSLGUI from "./openssl-gui/OpenSSL_GUI"

class CommandLine extends React.Component {

    emscrWasmTerm

    constructor(props) {
        super(props)

        window.commandLine = this // todo: debug

        // init emscripten wasm xterm addon
        this.emscrWasmTerm = new EmscrWasmTerm(baseUrl + "bin", baseUrl + "bin")

        // register api handlers for addon interaction
        this.emscrWasmTerm.onFileSystemUpdate = files => this.setFiles(files)
        this.emscrWasmTerm.onBeforeCommandRun = () => { if(!this.emscrWasmTerm._worker) this.setLoading("executing command") }
        this.emscrWasmTerm.onCommandRunFinish = () => { if(!this.emscrWasmTerm._worker) this.setLoading(false) }

        this.state = {
            loading: false,
            files: this.emscrWasmTerm._wasmFsFiles,

            openSSL: {
                curvesList: [], cipherList: [], hashfunList: []
            } // internal data fetched from openssl
        }

        // set custom openssl welcome message
        this.emscrWasmTerm._printWelcomeMessage = () => {
            return new Promise(resolve => {
                this.emscrWasmTerm._xtermEcho.abortRead()
                this.emscrWasmTerm._xterm.write(`\x1b[1;32m
 _ _ _     _      _____             _____ _____ __    \r
| | | |___| |_   |     |___ ___ ___|   __|   __|  |   \r
| | | | -_| . |  |  |  | . | -_|   |__   |__   |  |__ \r
|_____|___|___|  |_____|  _|___|_|_|_____|_____|_____|\r
                       |_|                            \r
                \x1b[37m\r`)
                this.emscrWasmTerm.runCommandHeadless("openssl", ["version"], null, version => {
                    // this.emscrWasmTerm._xterm.write("\x1B[A")
                    this.emscrWasmTerm._xterm.write("\r\n" + version.output + "\r")
                    this.emscrWasmTerm._xterm.write("Compiled to WebAssembly with Emscripten. "
                        + (this.emscrWasmTerm._worker ? "Running in WebWorker" : "Worker not available") + ".\r\n\r\n")
                    this.emscrWasmTerm._xterm.write("Usage: openssl [command] [params]\r\n\r\n")

                    // wait until output has been written and resolve
                    this.emscrWasmTerm._waitForOutputPause().then(() => resolve())
                }).catch(e => console.error("error while printWelcomeMessage:", e))
            })
        }

        // init component values depending on openssl internals
        this.emscrWasmTerm.onActivated = async () => {

            let curves = []
            let ciphers = []
            let hashes = []

            // 1) fetch elliptic curves list from openssl
            const curvesList = await this.emscrWasmTerm.runCommandHeadless("openssl", ["ecparam", "-list_curves"])
            curvesList.stdout.split("\n").forEach(row => {

                let name, description
                let cols = row.split(":")

                if(cols.length == 0) return // skip

                if(cols.length == 1) { // multiple lines description, append to last elem
                    if(!curves[curves.length-1]) return
                    curves[curves.length-1].description = curves[curves.length-1].description.trim() + " " + cols[0].trim()
                }

                if(cols.length > 1) { // name + description + x
                    name = cols.shift().trim()
                    description = cols.map(col => col.trim()).join(" ")
                    curves.push({ name: name, description: description })
                }

            })

            // 2) fetch encrypt decrypt ciphers list from openssl
            ciphers = (await this.emscrWasmTerm.runCommandHeadless("openssl", ["enc", "-list"]))
                .stdout.split("\n").slice(1).map(x => x.split(" ").filter(y => y))
                .reduce((a, b) => a.concat(b), []).map(x => x.substring(1))

            // 3) fetch hash functions list from openssl
            hashes = (await this.emscrWasmTerm.runCommandHeadless("openssl", ["dgst", "-list"]))
                .stdout.split("\n").slice(1).map(x => x.split(" ").filter(y => y))
                .reduce((a, b) => a.concat(b), []).map(x => x.substring(1))

            // sort the lists alphabetically
            curves.sort((a, b) => a.name.localeCompare(b.name))
            ciphers.sort((a, b) => a.localeCompare(b))
            hashes.sort((a, b) => a.localeCompare(b))

            // assign fetched values to component state
            this.setState({ openSSL: Object.assign({}, this.state.openSSL,
                { curvesList: curves, cipherList: ciphers, hashfunList: hashes }) })

        }

    }

    render() {

        return (
            <div>

                <div style={{position: "relative"}}>
                    <XTerm addons={[this.emscrWasmTerm]}
                        options={{ fontSize: 15, fontFamily: "monospace" }} />

                    { this.state.loading && <div className="loading">
                        <i className="fa fa-spin fa-circle-o-notch fa-3x mt-1 mb-3"></i>
                        <div className="small">{this.state.loading}</div>
                    </div> }
                </div>

                <OpenSSLGUI files={this.state.files} setFiles={files => this.setFiles(files)}
                    runCommand={line => this.runCommandFromOpenSSLGUI(line)} cipherList={this.state.openSSL.cipherList}
                    curvesList={this.state.openSSL.curvesList} hashfunList={this.state.openSSL.hashfunList} />

            </div>
        )
    }


    setLoading(value) { // string or boolean
        if(value) this.setState({ loading: value })
        else this.setState({ loading: false })
    }

    setFiles(files) {
        this.emscrWasmTerm._wasmFsFiles = files
        this.setState(() => ({ files: this.emscrWasmTerm._wasmFsFiles }))
        // state is passed as a function to use latest reference to wasmFsFiles
    }


    async runCommandFromOpenSSLGUI(line) {

        // only run one command at a time
        if(this.emscrWasmTerm._isRunningCommand) return

        // show command on terminal
        this.emscrWasmTerm._xterm.write(line + "\r\n")

        // abort current repl
        this.emscrWasmTerm._xtermEcho.abortRead("Everything is fine, running command from GUI")

        // execute line of commands
        await this.emscrWasmTerm.runLine(line)

        // print newline after
        this.emscrWasmTerm._xterm.write("\r\n\r\n")

        // restart repl
        this.emscrWasmTerm.repl()

    }

}

export default CommandLine
