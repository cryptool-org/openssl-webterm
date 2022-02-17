import React from "react"
import { Button, Col, Form, Row } from "react-bootstrap"
import CommandField from "../CommandField"

class EncryptionTab extends React.Component {

    /**
     * should get props:
     * files, cipherList, runCommand
     */

    constructor(props) {
        super(props)

        this.state = {

            /* default values */
            mode: "encrypt",
            inputtype: "text",
            inputtext: "Hello world",
            cipher: "aes-256-cbc",
            passphrasetype: "text",
            outputfile: "encrypted.data",
            pbkdf2: "true",
            salt: "true",
            base64: "true"

        }

        // save initial state for reset (copy - no reference)
        this._initialState = JSON.parse(JSON.stringify(this.state))

        window.encr = this // todo: debug

    }

    render() {

        // validate fields and build command
        const whatsValid = this._validateFields()
        const command = this._buildCommand(whatsValid)

        return <Form onSubmit={e => e.preventDefault()}>

            <Row className="flex-md-row-reverse justify-content-between">
                <Col xs={12} md="auto" className="d-flex flex-column mb-2 mb-md-0">
                    <Button variant="dark" size="sm" className="mb-4 mb-md-0"
                        onClick={() => this._resetFields()}>
                            <i className="fa fa-undo"></i> Reset fields
                    </Button>
                </Col>
                <Col cs={12} md="auto">
                    <Form.Group>
                        <Form.Label className="d-inline-block mr-3">Mode:</Form.Label>
                        <Form.Check custom inline type="radio" name="mode" value="encrypt"
                            label="Encrypt" onChange={e => this.onChange(e)} id="encdec-mode-encrypt"
                            checked={this.state.mode == "encrypt"} />
                        <Form.Check custom inline type="radio" name="mode" value="decrypt"
                            label="Decrypt" onChange={e => this.onChange(e)} id="encdec-mode-decrypt"
                            checked={this.state.mode == "decrypt"} />
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group>

                <Form.Label>
                    <span className="mr-3">Input:</span>
                    <Form.Check custom inline type="radio" name="inputtype" value="text"
                        label="Text" onChange={e => this.onChange(e)} id="encdec-inputtype-text"
                        checked={this.state.inputtype == "text"} />
                    <Form.Check custom inline type="radio" name="inputtype" value="file"
                        label="File" onChange={e => this.onChange(e)} id="encdec-inputtype-file"
                        checked={this.state.inputtype == "file"} />
                </Form.Label>

                {this.state.inputtype == "text" &&
                <Form.Control as="textarea" name="inputtext" value={this.state.inputtext}
                    onChange={e => this.onChange(e)} isValid={whatsValid.inputtext}
                    isInvalid={this._isInvalid(whatsValid.inputtext)} />}

                {this.state.inputtype == "file" &&
                <Form.Control as="select" value={this.state.inputfile} name="inputfile" onChange={e => this.onChange(e)}
                    isInvalid={this._isInvalid(whatsValid.inputfile)} isValid={whatsValid.inputfile}>
                        <option key={0} value="">Select file</option>
                        {this.props.files.map(file => <option key={file.name} value={file.name}>{file.name}</option>)}
                </Form.Control>}

            </Form.Group>

            <Row>
                <Col>
                    <Form.Group>
                        <Form.Label>Cipher</Form.Label>
                        <Form.Control as="select" value={this.state.cipher} name="cipher" onChange={e => this.onChange(e)}
                            isInvalid={this._isInvalid(whatsValid.cipher)} isValid={whatsValid.cipher}>
                                {this.props.cipherList.map(cipher => <option key={cipher} value={cipher}>{cipher}</option>)}
                        </Form.Control>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group>

                        <Form.Label>
                            <span className="mr-3">Passphrase:</span>
                            <Form.Check custom inline type="radio" name="passphrasetype" value="text"
                                label="Text" onChange={e => this.onChange(e)} id="encdec-passphrasetype-text"
                                checked={this.state.passphrasetype == "text"} />
                            <Form.Check custom inline type="radio" name="passphrasetype" value="file"
                                label="File" onChange={e => this.onChange(e)} id="encdec-passphrasetype-file"
                                checked={this.state.passphrasetype == "file"} />
                            <Form.Check custom inline type="radio" name="passphrasetype" value="rsakey"
                                label="RSA Key" onChange={e => this.onChange(e)} id="encdec-passphrasetype-rsakey"
                                checked={this.state.passphrasetype == "rsakey"} />
                        </Form.Label>

                        {this.state.passphrasetype == "text" &&
                        <Form.Control type="password" placeholder="Enter passphrase .." value={this.state.passphrasetext || ""}
                            name="passphrasetext" onChange={e => this.onChange(e)}
                            isInvalid={this._isInvalid(whatsValid.passphrasetext)} isValid={whatsValid.passphrasetext} />}

                        {this.state.passphrasetype == "file" &&
                        <Form.Control as="select" value={this.state.passphrasefile} name="passphrasefile" onChange={e => this.onChange(e)}
                            isInvalid={this._isInvalid(whatsValid.passphrasefile)} isValid={whatsValid.passphrasefile}>
                                <option key={0} value="">Select file</option>
                                {this.props.files.map(file => <option key={file.name} value={file.name}>{file.name}</option>)}
                        </Form.Control>}

                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Form.Group>
                        <Form.Label>
                            <Form.Check custom inline type="checkbox" name="useoutputfile" id="encdec-useoutputfile"
                                label="Output to file" value={(this.state.useoutputfile == "true" ? "false" : "true")}
                                onChange={e => this.onChange(e)} checked={this.state.useoutputfile == "true"} />
                        </Form.Label>
                        <Form.Control type="text" value={this.state.outputfile} name="outputfile"
                            onChange={e => this.onChange(e)} disabled={this.state.useoutputfile != "true"}
                            isInvalid={this._isInvalid(whatsValid.outputfile)} isValid={whatsValid.outputfile} />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Label className="d-block">Options:</Form.Label>
                    <Form.Check custom inline type="checkbox" name="pbkdf2" id="encdec-pbkdf2"
                        label="PBKDF2" value={(this.state.pbkdf2 == "true" ? "false" : "true")}
                        onChange={e => this.onChange(e)} checked={this.state.pbkdf2 == "true"} />
                    <Form.Check custom inline type="checkbox" name="salt" id="encdec-salt"
                        label="Salt" value={(this.state.salt == "true" ? "false" : "true")}
                        onChange={e => this.onChange(e)} checked={this.state.salt == "true"} />
                    <Form.Check custom inline type="checkbox" name="base64" id="encdec-base64"
                        label="Base64" value={(this.state.base64 == "true" ? "false" : "true")}
                        onChange={e => this.onChange(e)} checked={this.state.base64 == "true"} />
                </Col>
            </Row>

            <hr style={{ marginTop: "0.5rem", marginBottom: "1.5rem" }} />
            <CommandField command={command} runCommand={this.props.runCommand}
                enableRun={!Object.values(whatsValid).includes(false)} />

        </Form>
    }


    onChange(e) {
        this.setState({ [e.target.name]: e.target.value })
    }

    _validateFields() {

        let whatsValid = {}

        // check if input text is valid
        if(this.state.inputtype == "text") {
            whatsValid.inputtext = !(!this.state.inputtext)
        } else whatsValid.inputtext = undefined

        // check if input file is valid
        if(this.state.inputtype == "file") {
            whatsValid.inputfile = !(!this.state.inputfile)
        } else whatsValid.inputfile = undefined

        // check if cipher was selected
        whatsValid.cipher = !(!this.state.cipher)

        // check if passphrase text is valid
        if(this.state.passphrasetype == "text") {
            whatsValid.passphrasetext = !(!this.state.passphrasetext)
        } else whatsValid.passphrasetext = undefined

        // check if passphrase file is valid
        if(this.state.passphrasetype == "file") {
            whatsValid.passphrasefile = !(!this.state.passphrasefile)
        } else whatsValid.passphrasefile = undefined

        // check if output file is valid
        if(this.state.useoutputfile == "true") {
            whatsValid.outputfile = !(!(this.state.outputfile || "").trim())
        } else whatsValid.outputfile = undefined

        return whatsValid

    }

    _buildCommand(whatsValid = {}) {

        if(Object.values(whatsValid).includes(false)) return "Please fill out the form completely"

        let command = "openssl enc"

        if(this.state.mode == "encrypt") command += " -e"
        if(this.state.mode == "decrypt") command += " -d"

        command += " -" + this.state.cipher

        if(this.state.inputtype == "text")
            command = "echo " + this.state.inputtext + " | " + command

        if(this.state.inputtype == "file")
            command += " -in " + this.state.inputfile

        if(this.state.passphrasetype == "text")
            command += " -k " + this.state.passphrasetext

        if(this.state.passphrasetype == "file")
            command += " -kfile " + this.state.passphrasefile

        if(this.state.pbkdf2 == "true")
            command += " -pbkdf2"

        if(this.state.salt == "true")
            command += " -salt"

        if(this.state.base64 == "true")
            command += " -a"

        if(this.state.useoutputfile == "true")
            command += " -out " + this.state.outputfile

        return command

    }

    _resetFields() {
        // overwrite current state with initial state (including undefined)
        this.setState(prevState => Object.fromEntries(Object.entries(prevState)
            .map(([key, value]) => [key, this._initialState[key]])))
    }

    _isInvalid(value) {
        // make undefined not mean false
        if(value == undefined) return undefined
        else return !value
    }

}

export default EncryptionTab
