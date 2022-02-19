import React from "react"
import { Button, Card, Col, Form, Row } from "react-bootstrap"
import CommandField from "../CommandField"
import Helpers from "../Helpers"

class GenKeysTab extends React.Component {

    constructor(props) {
        super(props)

        // define static form values
        this._numbits = [1024, 2048, 4096] // available key lenghts
        this._keyFormats = ["PEM", "DER"] // available key formats

        this.state = {

            /* default values */
            keytype: "rsa",

            privkeyFields: {
                outputfile: "privkey." + this._keyFormats[0].toLowerCase(),
                keylength: this._numbits[0],
                elcurvename: "prime256v1", // this.props.curvesList[0]?.name
                passphrasetype: "text",
                cipher: "aes-256-cbc"
            },

            pubkeyFields: {
                outputfile: "pubkey." + this._keyFormats[0].toLowerCase(),
                passphrasetype: "text",
                keyformat: this._keyFormats[0]
            }

        }

        // save initial state for reset (copy - no reference)
        this._initialState = JSON.parse(JSON.stringify(this.state))

        window.rsa = this // todo: debug

    }

    render() {

        // filter files for needed private key format
        this.privateKeys = (this.state.keytype == "ec")
            ? Helpers.getEllipticCurvesParamsFilenamesFromFiles(this.props.files)
            : Helpers.getPrivateKeysFilenamesFromFiles(this.props.files)

        // check if last selected file (inputprivkey) is still available
        if(this.state.pubkeyFields.inputprivkey != "" // "" means "Select file"
        && !this.privateKeys.includes(this.state.pubkeyFields.inputprivkey))
            this.state.pubkeyFields.inputprivkey = undefined

        // set default pubkey input privkey file (on files update)
        if(this.state.pubkeyFields.inputprivkey == undefined && this.privateKeys.length > 0)
            this.state.pubkeyFields.inputprivkey = this.privateKeys[0]

        // todo: maybe make the upper more general? -> update all file selects
        // note: will also be used in EncryptionTab.js

        // check if selected inputprivkey (for pubkey derivation) is encrypted
        if(this.state.pubkeyFields.inputprivkey != "") {
            let inputprivkeyFile = this.props.files.find(file => file.name == this.state.pubkeyFields.inputprivkey)
            this.isInputprivkeyEncrypted = inputprivkeyFile ? Helpers.isKeyEncrypted(inputprivkeyFile) : undefined
        } else this.isInputprivkeyEncrypted = undefined

        // validate fields and build command for privkey
        const whatsValidPriv = this._validatePrivkeyFields()
        const privkeyCommand = this._buildPrivkeyCommand(whatsValidPriv)

        // validate fields and build command for pubkey
        const whatsValidPub = this._validatePubkeyFields()
        const pubkeyCommand = this._buildPubkeyCommand(whatsValidPub)

        return <>

            <Form.Group>
                <Form.Label className="d-inline-block mr-3 mb-0">Key type:</Form.Label>
                <Form.Check custom inline type="radio" name="keytype" value="rsa"
                    label="RSA" onChange={e => this.onChange(e)} id="genkey-keytype-rsa"
                    checked={this.state.keytype == "rsa"}  />
                <Form.Check custom inline type="radio" name="keytype" value="ec"
                    label="Elliptic curves" onChange={e => this.onChange(e)}
                    checked={this.state.keytype == "ec"} id="genkey-keytype-ec" />
            </Form.Group>

            <Form onSubmit={e => e.preventDefault()}>

            <Card className="mt-4">
                <Card.Header className={"d-flex align-items-center justify-content-between"}>
                    <b>1) Generate {this.state.keytype != "ec" ? "Private Key" : "EC Params"}</b>
                    <Button variant="dark" size="sm" onClick={() => this._resetPrivkeyFields()}>
                        <i className="fa fa-undo"></i> Reset fields
                    </Button>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col xs={12} md={6}>

                            {this.state.keytype == "rsa" &&
                            <Form.Group>
                                <Form.Label>Key length</Form.Label>
                                <Form.Control required as="select" value={this.state.privkeyFields.keylength}
                                    name="keylength" onChange={e => this._onPrivkeyFieldChange(e)}
                                    isValid={whatsValidPriv.keylength} isInvalid={this._isInvalid(whatsValidPriv.keylength)}>
                                        {this._numbits.map(numbit => <option key={numbit} value={numbit}>{numbit}-bit</option>)}
                                </Form.Control>
                            </Form.Group>}

                            {this.state.keytype == "ec" &&
                            <Form.Group>
                                <Form.Label>Elliptic curve name</Form.Label>
                                <Form.Control required as="select" value={this.state.privkeyFields.elcurvename}
                                    name="elcurvename" onChange={e => this._onPrivkeyFieldChange(e)}
                                    isValid={whatsValidPriv.elcurvename} isInvalid={this._isInvalid(whatsValidPriv.elcurvename)}>
                                        {this.props.curvesList.map(curve =>
                                            <option key={curve.name} value={curve.name}>{curve.name} ({curve.description})</option>)}
                                </Form.Control>
                            </Form.Group>}

                        </Col>

                        {this.state.keytype == "rsa" &&
                        <Col xs={12} md={6}>

                            <Form.Group>

                                <Form.Label className="d-block">
                                    <Form.Check custom inline type="checkbox" name="encrypt" id="genkey-privkey-encrypt" className="mr-3"
                                        label="Encrypt (Passphrase):" value={(this.state.privkeyFields.encrypt == "true" ? "false" : "true")}
                                        onChange={e => this._onPrivkeyFieldChange(e)} checked={this.state.privkeyFields.encrypt == "true"} />
                                    <Form.Check custom inline type="radio" name="passphrasetype" value="text"
                                        label="Text" onChange={e => this._onPrivkeyFieldChange(e)} id="genkey-privkey-passphrasetype-text"
                                        disabled={this.state.privkeyFields.encrypt != "true"}
                                        checked={this.state.privkeyFields.passphrasetype == "text"} />
                                    <Form.Check custom inline type="radio" name="passphrasetype" value="file"
                                        label="File" onChange={e => this._onPrivkeyFieldChange(e)} id="genkey-privkey-passphrasetype-file"
                                        disabled={this.state.privkeyFields.encrypt != "true"}
                                        checked={this.state.privkeyFields.passphrasetype == "file"} />
                                </Form.Label>

                                {this.state.privkeyFields.passphrasetype == "text" &&
                                <Form.Control type="password" placeholder={(this.state.privkeyFields.encrypt == "true") ? "Enter passphrase .." : ""}
                                    name="passphrasetext" value={(this.state.privkeyFields.encrypt == "true" ? (this.state.privkeyFields.passphrasetext || "") : "")}
                                    onChange={e => this._onPrivkeyFieldChange(e)} disabled={this.state.privkeyFields.encrypt != "true"}
                                    isInvalid={this._isInvalid(whatsValidPriv.passphrasetext)} isValid={whatsValidPriv.passphrasetext} />}

                                {this.state.privkeyFields.passphrasetype == "file" &&
                                <Form.Control as="select" value={(this.state.privkeyFields.encrypt == "true") ? this.state.passphrasefile : ""}
                                    name="passphrasefile" onChange={e => this._onPrivkeyFieldChange(e)} disabled={this.state.privkeyFields.encrypt != "true"}
                                    isInvalid={this._isInvalid(whatsValidPriv.passphrasefile)} isValid={whatsValidPriv.passphrasefile} >
                                        <option key={0} value="">{(this.state.privkeyFields.encrypt == "true") ? "Select file" : ""}</option>
                                        {this.props.files.map(file => <option key={file.name} value={file.name}>{file.name}</option>)}
                                </Form.Control>}

                            </Form.Group>

                        </Col>}

                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Label>
                                    <Form.Check custom inline type="checkbox" name="useoutputfile" id="genkey-privkey-useoutputfile"
                                        label="Output Private Key to file" value={(this.state.privkeyFields.useoutputfile == "true" ? "false" : "true")}
                                        onChange={e => this._onPrivkeyFieldChange(e)} checked={this.state.privkeyFields.useoutputfile == "true"} />
                                </Form.Label>
                                <Form.Control type="text" value={this.state.privkeyFields.outputfile || ""} name="outputfile"
                                    onChange={e => this._onPrivkeyFieldChange(e)} disabled={this.state.privkeyFields.useoutputfile != "true"}
                                    isInvalid={this._isInvalid(whatsValidPriv.outputfile)} isValid={whatsValidPriv.outputfile} />
                            </Form.Group>
                        </Col>

                        {this.state.keytype == "rsa" &&
                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Label className={(this.state.privkeyFields.encrypt != "true" ? "text-muted" : "")}>Encryption Cipher</Form.Label>
                                <Form.Control as="select" value={(this.state.privkeyFields.encrypt == "true") ? this.state.privkeyFields.cipher : ""} name="cipher"
                                    onChange={e => this._onPrivkeyFieldChange(e)} disabled={this.state.privkeyFields.encrypt != "true"}
                                    isInvalid={this._isInvalid(whatsValidPriv.cipher)} isValid={whatsValidPriv.cipher}>
                                        <option key={0} value="">{(this.state.privkeyFields.encrypt == "true") ? "Select cipher" : ""}</option>
                                        {this.props.cipherList.map(cipher => <option key={cipher} value={cipher}>{cipher}</option>)}
                                </Form.Control>
                            </Form.Group>
                        </Col>}

                    </Row>

                    <hr style={{ marginTop: "0.5rem", marginBottom: "1.5rem" }} />
                    <CommandField command={privkeyCommand} runCommand={this.props.runCommand}
                        enableRun={!Object.values(whatsValidPriv).includes(false)} />

                </Card.Body>
            </Card>

            </Form>
            <Form onSubmit={e => e.preventDefault()}>

            <Card className="mt-4">
                <Card.Header className={"d-flex align-items-center justify-content-between"}>
                    <b>2) Derive Public Key</b>
                    <Button variant="dark" size="sm" onClick={() => this._resetPubkeyFields()}>
                        <i className="fa fa-undo"></i> Reset fields
                    </Button>
                </Card.Header>
                <Card.Body>
                    <Row>

                        <Col xs={12} md={this.state.keytype == "ec" ? 4 : 6}>
                            <Form.Group>
                                <Form.Label>{this.state.keytype != "ec" ? "Private Key" : "EC Params"} input file name</Form.Label>
                                <Form.Control required as="select" value={this.state.pubkeyFields.inputprivkey}
                                    name="inputprivkey" onChange={e => this._onPubkeyFieldChange(e)}
                                    isValid={whatsValidPub.inputprivkey} isInvalid={this._isInvalid(whatsValidPub.inputprivkey)}>
                                        <option key={0} value="">Select file</option>
                                        {this.privateKeys.map(privkey => <option key={privkey} value={privkey}>{privkey}</option>)}
                                </Form.Control>
                            </Form.Group>
                        </Col>

                        {this.state.keytype == "rsa" &&
                        <Col xs={12} md={6}>

                            <Form.Group>

                                <Form.Label className="d-block">
                                    <span className={"mr-3 " + (!this.isInputprivkeyEncrypted ? "text-muted" : "")}>Private Key Passphrase:</span>
                                    <Form.Check custom inline type="radio" name="passphrasetype" value="text"
                                        label="Text" onChange={e => this._onPubkeyFieldChange(e)} id="genkey-pubkey-passphrasetype-text"
                                        disabled={!this.isInputprivkeyEncrypted} checked={this.state.pubkeyFields.passphrasetype == "text"} />
                                    <Form.Check custom inline type="radio" name="passphrasetype" value="file"
                                        label="File" onChange={e => this._onPubkeyFieldChange(e)} id="genkey-pubkey-passphrasetype-file"
                                        disabled={!this.isInputprivkeyEncrypted} checked={this.state.pubkeyFields.passphrasetype == "file"} />
                                </Form.Label>

                                {this.state.pubkeyFields.passphrasetype == "text" &&
                                <Form.Control type="password" placeholder={this.isInputprivkeyEncrypted ? "Enter passphrase .." : "Private Key not encrypted"}
                                    name="passphrasetext" value={(this.isInputprivkeyEncrypted) ? (this.state.pubkeyFields.passphrasetext || "") : ""}
                                    onChange={e => this._onPubkeyFieldChange(e)} disabled={!this.isInputprivkeyEncrypted}
                                    isInvalid={this._isInvalid(whatsValidPub.passphrasetext)} isValid={whatsValidPub.passphrasetext} />}

                                {this.state.pubkeyFields.passphrasetype == "file" &&
                                <Form.Control as="select" value={(this.isInputprivkeyEncrypted) ? this.state.pubkeyFields.passphrasefile : ""}
                                    name="passphrasefile" onChange={e => this._onPubkeyFieldChange(e)} disabled={!this.isInputprivkeyEncrypted}
                                    isInvalid={this._isInvalid(whatsValidPub.passphrasefile)} isValid={whatsValidPub.passphrasefile} >
                                        <option key={0} value="">{(this.isInputprivkeyEncrypted) ? "Select file" : "Private Key not encrypted"}</option>
                                        {this.props.files.map(file => <option key={file.name} value={file.name}>{file.name}</option>)}
                                </Form.Control>}

                            </Form.Group>

                        </Col>}

                        <Col xs={12} md={this.state.keytype == "ec" ? 4 : 6}>
                            <Form.Group>
                                <Form.Label>
                                    <Form.Check custom inline type="checkbox" name="useoutputfile" id="genkey-pubkey-useoutputfile"
                                        label="Output Public Key to file" value={(this.state.pubkeyFields.useoutputfile == "true" ? "false" : "true")}
                                        onChange={e => this._onPubkeyFieldChange(e)} checked={this.state.pubkeyFields.useoutputfile == "true"} />
                                </Form.Label>
                                <Form.Control type="text" value={this.state.pubkeyFields.outputfile} name="outputfile"
                                    onChange={e => this._onPubkeyFieldChange(e)} disabled={this.state.pubkeyFields.useoutputfile != "true"}
                                    isInvalid={this._isInvalid(whatsValidPub.outputfile)} isValid={whatsValidPub.outputfile} />
                            </Form.Group>
                        </Col>

                        <Col xs={12} md={this.state.keytype == "ec" ? 4 : 6}>
                            <Form.Group>
                                <Form.Label>Public Key output format</Form.Label>
                                <Form.Control required as="select" value={this.state.pubkeyFields.keyformat}
                                    name="keyformat" onChange={e => this._onPubkeyFieldChange(e)}
                                    isValid={whatsValidPub.keyformat} isInvalid={this._isInvalid(whatsValidPub.keyformat)}>
                                        {this._keyFormats.map(format => <option key={format} value={format}>{format}</option>)}
                                </Form.Control>
                            </Form.Group>
                        </Col>

                    </Row>

                    <hr style={{ marginTop: "0.5rem", marginBottom: "1.5rem" }} />
                    <CommandField command={pubkeyCommand} runCommand={this.props.runCommand}
                        enableRun={!Object.values(whatsValidPub).includes(false)} />

                </Card.Body>
            </Card>

            </Form>

        </>

    }

    onChange(e) {
        // special case: reset pubkey field "inputprivkey" on keytype change
        if(e.target.name == "keytype") this.state.pubkeyFields.inputprivkey
            = this._initialState.pubkeyFields.inputprivkey // todo: maybe copy not reference?

        this.setState({ [e.target.name]: e.target.value })
    }


    /* private key fields handling */

    _onPrivkeyFieldChange(e) {
        this.setState({ privkeyFields: { ...this.state.privkeyFields,
            [e.target.name]: e.target.value } })
    }

    _validatePrivkeyFields() {

        let whatsValid = {}

        // check if output filename is valid
        if(this.state.privkeyFields.useoutputfile == "true")
            whatsValid.outputfile = !(!(this.state.privkeyFields.outputfile || "").trim())

        if(this.state.keytype == "rsa") {

            // check if key length is valid
            whatsValid.keylength = this._numbits.includes(parseInt(this.state.privkeyFields.keylength))

            if(this.state.privkeyFields.encrypt == "true") {

                // check if passphrase text is valid
                if(this.state.privkeyFields.passphrasetype == "text")
                    whatsValid.passphrasetext = !(!this.state.privkeyFields.passphrasetext)

                // check if passphrase file is valid
                if(this.state.privkeyFields.passphrasetype == "file")
                    whatsValid.passphrasefile = !(!this.state.privkeyFields.passphrasefile)

                // check if cipher is valid
                whatsValid.cipher = this.props.cipherList.includes(this.state.privkeyFields.cipher)

            }

        }

        if(this.state.keytype == "ec") {

            // check if elliptic curve is valid
            whatsValid.elcurvename = !(!(this.state.privkeyFields.elcurvename || "").trim())

        }

        return whatsValid

    }

    _buildPrivkeyCommand(whatsValid = {}) {

        if(Object.values(whatsValid).includes(false)) return "Please fill out the form completely"

        let command = "openssl"

        if(this.state.keytype == "rsa") {

            command += " genrsa"

            // todo: entweder special chars replacen oder parameter in "" übergeben (anführungszeichen)
            if(this.state.privkeyFields.encrypt == "true") {
                command += " -" + this.state.privkeyFields.cipher

                if(this.state.privkeyFields.passphrasetype == "text")
                    command += " -passout pass:" + this.state.privkeyFields.passphrasetext

                if(this.state.privkeyFields.passphrasetype == "file")
                    command += " -passout file:" + this.state.privkeyFields.passphrasefile
            }

            if(this.state.privkeyFields.useoutputfile == "true")
                command += " -out " + this.state.privkeyFields.outputfile

            command += " " + this.state.privkeyFields.keylength

        }

        if(this.state.keytype == "ec") {
            command += " ecparam -genkey"
            command += " -name " + this.state.privkeyFields.elcurvename

            if(this.state.privkeyFields.useoutputfile == "true")
                command += " -out " + this.state.privkeyFields.outputfile
        }

        return command

    }

    _resetPrivkeyFields() {
        this.setState({ privkeyFields: this._initialState.privkeyFields })
    }


    /* public key fields handling */

    _onPubkeyFieldChange(e) {
        let pubkeyFields = { ...this.state.pubkeyFields,
            [e.target.name]: e.target.value }

        // special case: replace extension in outputfile on keyformat change
        if(e.target.name == "keyformat") pubkeyFields.outputfile = pubkeyFields.outputfile
            .replace(new RegExp("\\.(" + this.state.pubkeyFields.keyformat.toLowerCase() + ")$"),
                "." + e.target.value.toLowerCase())

        this.setState({ pubkeyFields: pubkeyFields })
    }

    _validatePubkeyFields() {

        let whatsValid = {}

        // check if input privkey is valid
        whatsValid.inputprivkey = this.privateKeys.includes(this.state.pubkeyFields.inputprivkey)

        if(this.isInputprivkeyEncrypted) {

            // check if passphrase text is valid
            if(this.state.pubkeyFields.passphrasetype == "text")
                whatsValid.passphrasetext = !(!this.state.pubkeyFields.passphrasetext)

            // check if passphrase file is valid
            if(this.state.pubkeyFields.passphrasetype == "file")
                whatsValid.passphrasefile = !(!this.state.pubkeyFields.passphrasefile)

        }

        // check if output filename is valid
        if(this.state.pubkeyFields.useoutputfile == "true")
            whatsValid.outputfile = !(!(this.state.pubkeyFields.outputfile || "").trim())

        // check if output key format is valid
        whatsValid.keyformat = this._keyFormats.includes(this.state.pubkeyFields.keyformat)

        return whatsValid

    }

    _buildPubkeyCommand(whatsValid = {}) {

        if(Object.values(whatsValid).includes(false)) return "Please fill out the form completely"

        let command = "openssl"

        if(this.state.keytype == "rsa") {
            command += " rsa -pubout"
            command += " -in " + this.state.pubkeyFields.inputprivkey

            if(this.isInputprivkeyEncrypted) {

                if(this.state.pubkeyFields.passphrasetype == "text")
                    command += " -passin pass:" + this.state.pubkeyFields.passphrasetext

                if(this.state.pubkeyFields.passphrasetype == "file")
                    command += " -passin file:" + this.state.pubkeyFields.passphrasefile
            }

            command += " -outform " + this.state.pubkeyFields.keyformat
            if(this.state.pubkeyFields.useoutputfile == "true")
                command += " -out " + this.state.pubkeyFields.outputfile
        }

        if(this.state.keytype == "ec") {
            command += " ec -pubout"
            command += " -in " + this.state.pubkeyFields.inputprivkey
            command += " -outform " + this.state.pubkeyFields.keyformat

            if(this.state.pubkeyFields.useoutputfile == "true")
                command += " -out " + this.state.pubkeyFields.outputfile
        }

        return command

    }

    _resetPubkeyFields() {
        this.setState({ pubkeyFields: this._initialState.pubkeyFields })
    }


    /* helper functions */

    _isInvalid(value) {
        // make undefined not mean false
        if(value == undefined) return undefined
        else return !value
    }

    /* _replaceSpecialChars(string) {

        // todo: replace special chars in file name
        const specialChars = ["|", "&", ";", "<", ">", "(", ")", "$", "`", "\\", "\"", "'", " ", "\t", "\n"]
        let cleanedValue = ""
        e.target.value.split("").forEach(char => {
            if(specialChars.includes(char)) char += "\\"
            cleanedValue += char
        })

        return string
    } */

}

export default GenKeysTab
