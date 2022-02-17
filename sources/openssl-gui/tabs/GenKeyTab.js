import React from "react"
import { Button, Card, Col, Form, Row } from "react-bootstrap"
import CommandField from "../CommandField"

class GenKeyTab extends React.Component {

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
            },

            pubkeyFields: {
                outputfile: "pubkey." + this._keyFormats[0].toLowerCase(),
                keyformat: this._keyFormats[0]
            }

        }

        // save initial state for reset (copy - no reference)
        this._initialState = JSON.parse(JSON.stringify(this.state))

        window.rsa = this // todo: debug

    }

    render() {

        // filter files for needed private key format
        const privateKeys = (this.state.keytype == "ec")
            ? this._getEllipticCurvesParamsFilenamesFromFiles()
            : this._getPrivateKeysFilenamesFromFiles()

        // check if last selected file (inputprivkey) is still available
        if(this.state.pubkeyFields.inputprivkey != 0 // 0 means "Select file"
        && !privateKeys.includes(this.state.pubkeyFields.inputprivkey))
            this.state.pubkeyFields.inputprivkey = undefined

        // set default pubkey input privkey file (on file update)
        if(this.state.pubkeyFields.inputprivkey == undefined && privateKeys.length > 0)
            this.state.pubkeyFields.inputprivkey = privateKeys[0]

        // todo: maybe make the upper more general? -> update all file selects

        // validate fields and build command for privkey
        const whatsValidPriv = this._validatePrivkeyFields()
        const privkeyCommand = this._buildPrivkeyCommand(whatsValidPriv)

        // validate fields and build command for pubkey
        const whatsValidPub = this._validatePubkeyFields()
        const pubkeyCommand = this._buildPubkeyCommand(whatsValidPub)

        return <Form onSubmit={e => e.preventDefault()}>

            <Form.Group>
                <Form.Label className="d-inline-block mr-3">Key type:</Form.Label>
                <Form.Check custom inline type="radio" name="keytype" value="rsa"
                    label="RSA" onChange={e => this.onChange(e)} id="genkey-keytype-rsa"
                    checked={this.state.keytype == "rsa"}  />
                <Form.Check custom inline type="radio" name="keytype" value="ec"
                    label="Elliptic curves" onChange={e => this.onChange(e)}
                    checked={this.state.keytype == "ec"} id="genkey-keytype-ec" />
            </Form.Group>

            <Card className="mt-4">
                <Card.Header className={"d-flex align-items-center justify-content-between"}>
                    <b>1) {this.state.keytype != "ec" ? "Private Key Generation" : "EC Param Generation"}</b>
                    <Button variant="dark" size="sm" onClick={() => this._resetPrivkeyFields()}>
                        <i className="fa fa-undo"></i> Reset fields
                    </Button>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col>

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
                        <Col>
                            <Form.Group>
                                <Form.Label>Passphrase <small className="text-muted">(leave empty for none)</small></Form.Label>
                                <Form.Control required type="text" value={this.state.privkeyFields.passphrase || ""}
                                    name="passphrase" onChange={e => this._onPrivkeyFieldChange(e)}
                                    isValid={whatsValidPriv.passphrase} isInvalid={this._isInvalid(whatsValidPriv.passphrase)} />
                            </Form.Group>
                        </Col>}
                        <Col>
                            <Form.Group>
                                <Form.Label>
                                    <Form.Check custom inline type="checkbox" name="useoutputfile" id="genkey-privkey-useoutputfile"
                                        label="Output private key to file" value={(this.state.privkeyFields.useoutputfile == "true" ? "false" : "true")}
                                        onChange={e => this._onPrivkeyFieldChange(e)} checked={this.state.privkeyFields.useoutputfile == "true"} />
                                </Form.Label>
                                <Form.Control type="text" value={this.state.privkeyFields.outputfile} name="outputfile"
                                    onChange={e => this._onPrivkeyFieldChange(e)} disabled={this.state.privkeyFields.useoutputfile != "true"}
                                    isInvalid={this._isInvalid(whatsValidPriv.outputfile)} isValid={whatsValidPriv.outputfile} />
                            </Form.Group>
                        </Col>
                    </Row>

                    <hr style={{ marginTop: "0.5rem", marginBottom: "1.5rem" }} />
                    <CommandField command={privkeyCommand} runCommand={this.props.runCommand}
                        enableRun={!Object.values(whatsValidPriv).includes(false)} />

                </Card.Body>
            </Card>

            <Card className="mt-4">
                <Card.Header className={"d-flex align-items-center justify-content-between"}>
                    <b>2) Public Key Generation</b>
                    <Button variant="dark" size="sm" onClick={() => this._resetPubkeyFields()}>
                        <i className="fa fa-undo"></i> Reset fields
                    </Button>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col>
                            <Form.Group>
                                <Form.Label>{this.state.keytype != "ec" ? "Private key" : "EC params"} input file name</Form.Label>
                                <Form.Control required as="select" value={this.state.pubkeyFields.inputprivkey}
                                    name="inputprivkey" onChange={e => this._onPubkeyFieldChange(e)}
                                    isValid={whatsValidPub.inputprivkey} isInvalid={this._isInvalid(whatsValidPub.inputprivkey)}>
                                        <option key={0} value="">Select file</option>
                                        {privateKeys.map(privkey => <option key={privkey} value={privkey}>{privkey}</option>)}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label>Public key output format</Form.Label>
                                <Form.Control required as="select" value={this.state.pubkeyFields.keyformat}
                                    name="keyformat" onChange={e => this._onPubkeyFieldChange(e)}
                                    isValid={whatsValidPub.keyformat} isInvalid={this._isInvalid(whatsValidPub.keyformat)}>
                                        {this._keyFormats.map(format => <option key={format} value={format}>{format}</option>)}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label>
                                    <Form.Check custom inline type="checkbox" name="useoutputfile" id="genkey-pubkey-useoutputfile"
                                        label="Output public key to file" value={(this.state.pubkeyFields.useoutputfile == "true" ? "false" : "true")}
                                        onChange={e => this._onPubkeyFieldChange(e)} checked={this.state.pubkeyFields.useoutputfile == "true"} />
                                </Form.Label>
                                <Form.Control type="text" value={this.state.pubkeyFields.outputfile} name="outputfile"
                                    onChange={e => this._onPubkeyFieldChange(e)} disabled={this.state.pubkeyFields.useoutputfile != "true"}
                                    isInvalid={this._isInvalid(whatsValidPub.outputfile)} isValid={whatsValidPub.outputfile} />
                            </Form.Group>
                        </Col>
                    </Row>

                    <hr style={{ marginTop: "0.5rem", marginBottom: "1.5rem" }} />
                    <CommandField command={pubkeyCommand} runCommand={this.props.runCommand}
                        enableRun={!Object.values(whatsValidPub).includes(false)} />

                </Card.Body>
            </Card>

        </Form>

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
        else whatsValid.outputfile = undefined

        if(this.state.keytype == "rsa") {

            // check if key length is valid
            whatsValid.keylength = this._numbits.includes(parseInt(this.state.privkeyFields.keylength))

            // check if passphrase is valid
            if((this.state.privkeyFields.passphrase || "").length > 0) whatsValid.passphrase = true

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

            if(this.state.privkeyFields.useoutputfile == "true")
                command += " -out " + this.state.privkeyFields.outputfile

            // todo: entweder special chars replacen oder parameter in "" übergeben (anführungszeichen)
            if((this.state.privkeyFields.passphrase || "").length > 0)
                command += " -passout pass:" + this.state.privkeyFields.passphrase

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
        whatsValid.inputprivkey = !(!this.state.pubkeyFields.inputprivkey)

        // check if output filename is valid
        if(this.state.pubkeyFields.useoutputfile == "true")
            whatsValid.outputfile = !(!(this.state.pubkeyFields.outputfile || "").trim())
        else whatsValid.outputfile = undefined

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

    // filter files for private keys -> return array of file names
    _getPrivateKeysFilenamesFromFiles() {
        let privateKeyList = []
        this.props.files.forEach(file => {

            // get first 100 chars of file (todo: maybe until line break?)
            const fileHead = (new TextDecoder).decode(file.bytes.subarray(0, 100))

            // define regular expression for private key headers
            const regex = new RegExp("^-----BEGIN * PRIVATE KEY-----")

            // check if it matches -> save filename
            if(fileHead.match(regex) != null) privateKeyList.push(file.name)

        })
        return privateKeyList
    }

    // filter files for ec param files -> return array of file names
    _getEllipticCurvesParamsFilenamesFromFiles() {
        let ecParamList = []
        this.props.files.forEach(file => {

            // get first 100 chars of file (todo: maybe until line break?)
            const fileHead = (new TextDecoder).decode(file.bytes.subarray(0, 100))

            // define regular expression for private key headers
            const regex = new RegExp("^-----BEGIN EC PARAMETERS-----")

            // check if it matches -> save filename
            if(fileHead.match(regex) != null) ecParamList.push(file.name)

        })
        return ecParamList
    }

}

export default GenKeyTab
