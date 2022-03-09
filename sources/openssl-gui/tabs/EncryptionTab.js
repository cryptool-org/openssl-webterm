import React from "react"
import { Button, Col, Form, Row } from "react-bootstrap"
import CommandField from "../CommandField"
import Helpers from "../Helpers"

import { Trans } from "react-i18next"
import i18next from "../../translations"

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
            inputtext: i18next.t("Hello world"),
            method: "cipher",
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

        // filter files for private or public keys
        const keyfiles = (this.state.mode == "encrypt")
            ? Helpers.getPublicKeysFilenamesFromFiles(this.props.files)
            : Helpers.getPrivateKeysFilenamesFromFiles(this.props.files)

        // check if last selected key file is still available
        if(this.state.key != 0 && !keyfiles.includes(this.state.key))
            this.state.key = undefined

        // set default key file (on files update)
        if(this.state.key == undefined && keyfiles.length > 0)
            this.state.key = keyfiles[0]

        // check if selected private key is encrypted
        if(this.state.method == "key" && this.state.mode == "decrypt" && this.state.key != "") {
            let privateKey = this.props.files.find(file => file.name == this.state.key)
            this.isPrivateKeyEncrypted = privateKey ? Helpers.isKeyEncrypted(privateKey) : undefined
        } else this.isPrivateKeyEncrypted = undefined

        // validate fields and build command
        const whatsValid = this._validateFields()
        const command = this._buildCommand(whatsValid)

        return <Form onSubmit={e => e.preventDefault()}>

            <Row className="flex-md-row-reverse justify-content-between">
                <Col xs={12} md="auto" className="d-flex flex-column mb-2 mb-md-0">
                    <Button variant="dark" size="sm" className="mb-4 mb-md-0"
                        onClick={() => this._resetFields()}>
                            <i className="fa fa-undo"></i> <Trans>Reset fields</Trans>
                    </Button>
                </Col>
                <Col cs={12} md="auto">
                    <Form.Group>
                        <Form.Label className="d-inline-block mr-3"><Trans>Mode</Trans>:</Form.Label>
                        <Form.Check custom inline type="radio" name="mode" value="encrypt"
                            label={i18next.t("Encrypt")} onChange={e => this.onChange(e)} id="encdec-mode-encrypt"
                            checked={this.state.mode == "encrypt"} />
                        <Form.Check custom inline type="radio" name="mode" value="decrypt"
                            label={i18next.t("Decrypt")} onChange={e => this.onChange(e)} id="encdec-mode-decrypt"
                            checked={this.state.mode == "decrypt"} />
                    </Form.Group>
                </Col>
            </Row>

            <hr style={{ marginTop: "0", marginBottom: "1.5rem" }} />

            <Form.Group>

                <Form.Label>
                    <span className="mr-3"><Trans>Input</Trans>:</span>
                    <Form.Check custom inline type="radio" name="inputtype" value="text"
                        label="Text" onChange={e => this.onChange(e)} id="encdec-inputtype-text"
                        checked={this.state.inputtype == "text"} />
                    <Form.Check custom inline type="radio" name="inputtype" value="file"
                        label={i18next.t("File")} onChange={e => this.onChange(e)} id="encdec-inputtype-file"
                        checked={this.state.inputtype == "file"} />
                </Form.Label>

                {this.state.inputtype == "text" &&
                <Form.Control as="textarea" name="inputtext" value={this.state.inputtext}
                    onChange={e => this.onChange(e)} isValid={whatsValid.inputtext}
                    isInvalid={this._isInvalid(whatsValid.inputtext)} rows={3} />}

                {this.state.inputtype == "file" &&
                <Form.Control as="select" value={this.state.inputfile} name="inputfile" onChange={e => this.onChange(e)}
                    isInvalid={this._isInvalid(whatsValid.inputfile)} isValid={whatsValid.inputfile}>
                        <option key={0} value="">{i18next.t("Select file")}</option>
                        {this.props.files.map(file => <option key={file.name} value={file.name}>{file.name}</option>)}
                </Form.Control>}

            </Form.Group>

            <Row>
                <Col>
                    <Form.Group>

                        <Form.Label>
                            <span className="mr-3"><Trans>Method</Trans>:</span>
                            <Form.Check custom inline type="radio" name="method" value="cipher"
                                label={i18next.t("Cipher")} onChange={e => this.onChange(e)} id="encdec-method-cipher"
                                checked={this.state.method == "cipher"} />
                            <Form.Check custom inline type="radio" name="method" value="key"
                                label={((this.state.mode == "encrypt") ? "Public" : "Private") + " Key"} onChange={e => this.onChange(e)} id="encdec-method-key"
                                checked={this.state.method == "key"} />
                        </Form.Label>

                        {this.state.method == "cipher" &&
                        <Form.Control as="select" value={this.state.cipher} name="cipher" onChange={e => this.onChange(e)}
                            isInvalid={this._isInvalid(whatsValid.cipher)} isValid={whatsValid.cipher}>
                                {this.props.cipherList.map(cipher => <option key={cipher} value={cipher}>{cipher}</option>)}
                        </Form.Control>}

                        {this.state.method == "key" &&
                        <Form.Control as="select" value={this.state.key} name="key" onChange={e => this.onChange(e)}
                            isInvalid={this._isInvalid(whatsValid.key)} isValid={whatsValid.key}>
                                <option key={0} value="">{i18next.t("Select file")}</option>
                                {keyfiles.map(keyfile => <option key={keyfile} value={keyfile}>{keyfile}</option>)}
                        </Form.Control>}

                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group>

                        <Form.Label className={"d-block " + ((this.state.method == "key" && this.state.mode == "encrypt")
                            || (this.state.method == "key" && this.state.mode == "decrypt" && !this.isPrivateKeyEncrypted) ? "text-muted" : "")}>

                            <span className="mr-3">{i18next.t(this.state.method == "cipher" ? "Cipher Passphrase" : ( this.state.mode == "decrypt" ? "Private Key Passphrase" : "" ))}:</span>
                            <Form.Check custom inline type="radio" name="passphrasetype" value="text"
                                label="Text" onChange={e => this.onChange(e)} id="encdec-passphrasetype-text"
                                disabled={(this.state.method == "key" && this.state.mode == "encrypt") || (this.state.method == "key" && this.state.mode == "decrypt" && !this.isPrivateKeyEncrypted)}
                                checked={this.state.passphrasetype == "text"} />
                            <Form.Check custom inline type="radio" name="passphrasetype" value="file"
                                label={i18next.t("File")} onChange={e => this.onChange(e)} id="encdec-passphrasetype-file"
                                disabled={(this.state.method == "key" && this.state.mode == "encrypt") || (this.state.method == "key" && this.state.mode == "decrypt" && !this.isPrivateKeyEncrypted)}
                                checked={this.state.passphrasetype == "file"} />
                        </Form.Label>

                        {this.state.passphrasetype == "text" &&
                        <Form.Control type="password" placeholder={(this.state.method == "key" && this.state.mode == "encrypt") ? i18next.t("Public Keys are not encrypted") : ( this.state.method == "key" && this.state.mode == "decrypt" && !this.isPrivateKeyEncrypted ? ( this.state.key?.length > 0 ? i18next.t("Private Key not encrypted") : i18next.t("No Private Key selected") ) :  i18next.t("Enter passphrase ..") )}
                            value={(this.state.method == "key" && this.state.mode == "encrypt") ? "" : (this.state.passphrasetext || "")}
                            name="passphrasetext" onChange={e => this.onChange(e)} disabled={(this.state.method == "key" && this.state.mode == "encrypt") || (this.state.method == "key" && this.state.mode == "decrypt" && !this.isPrivateKeyEncrypted)}
                            isInvalid={this._isInvalid(whatsValid.passphrasetext)} isValid={whatsValid.passphrasetext} />}

                        {this.state.passphrasetype == "file" &&
                        <Form.Control as="select" value={(this.state.method == "key" && this.state.mode == "encrypt") ? "" : this.state.passphrasefile}
                            name="passphrasefile" onChange={e => this.onChange(e)}
                            isInvalid={this._isInvalid(whatsValid.passphrasefile)} isValid={whatsValid.passphrasefile}
                            disabled={(this.state.method == "key" && this.state.mode == "encrypt") || (this.state.method == "key" && this.state.mode == "decrypt" && !this.isPrivateKeyEncrypted)}>
                                <option key={0} value="">{(this.state.method == "key" && this.state.mode == "encrypt") ? i18next.t("Public Keys are not encrypted") : ( this.state.method == "key" && this.state.mode == "decrypt" && !this.isPrivateKeyEncrypted ? ( this.state.key?.length > 0 ? i18next.t("Private Key not encrypted") : i18next.t("No Private Key selected") ) : i18next.t("Select file") )}</option>
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
                                label={i18next.t("Output to file")} value={(this.state.useoutputfile == "true" ? "false" : "true")}
                                onChange={e => this.onChange(e)} checked={this.state.useoutputfile == "true"} />
                        </Form.Label>
                        <Form.Control type="text" value={this.state.outputfile} name="outputfile"
                            onChange={e => this.onChange(e)} disabled={this.state.useoutputfile != "true"}
                            isInvalid={this._isInvalid(whatsValid.outputfile)} isValid={whatsValid.outputfile} />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Label className={"d-block " + (this.state.method == "key" ? "text-muted" : "")}>
                        <Trans>Options</Trans>:
                    </Form.Label>
                    <Form.Check custom inline type="checkbox" name="pbkdf2" id="encdec-pbkdf2"
                        label="PBKDF2" value={(this.state.pbkdf2 == "true" ? "false" : "true")}
                        onChange={e => this.onChange(e)} checked={(this.state.method == "key") ? false : this.state.pbkdf2 == "true"}
                        disabled={this.state.method == "key"} />
                    <Form.Check custom inline type="checkbox" name="salt" id="encdec-salt"
                        label="Salt" value={(this.state.salt == "true" ? "false" : "true")}
                        onChange={e => this.onChange(e)} checked={(this.state.method == "key") ? false : this.state.salt == "true"}
                        disabled={this.state.method == "key"} />
                    <Form.Check custom inline type="checkbox" name="base64" id="encdec-base64"
                        label="Base64" value={(this.state.base64 == "true" ? "false" : "true")}
                        onChange={e => this.onChange(e)} checked={(this.state.method == "key") ? false : this.state.base64 == "true"}
                        disabled={this.state.method == "key"} />
                </Col>
            </Row>

            <hr style={{ marginTop: "0.5rem", marginBottom: "1.5rem" }} />
            <CommandField command={command} runCommand={this.props.runCommand}
                enableRun={!Object.values(whatsValid).includes(false)} />

        </Form>
    }


    onChange(e) {
        let fields = { ...this.state, [e.target.name]: e.target.value }

        // special case: replace output filename on mode change (for unchanged values)
        if(e.target.name == "mode") {
            const encryptOriginalValue = this._initialState.outputfile.replace("decrypt", "encrypt")
            const decryptOriginalValue = this._initialState.outputfile.replace("encrypt", "decrypt")
            if(fields.outputfile == encryptOriginalValue) fields.outputfile = decryptOriginalValue
            else if(fields.outputfile == decryptOriginalValue) fields.outputfile = encryptOriginalValue
        }

        this.setState(fields)
    }

    _validateFields() {

        let whatsValid = {}

        // check if input text is valid
        if(this.state.inputtype == "text")
            whatsValid.inputtext = !(!this.state.inputtext)

        // check if input file is valid
        if(this.state.inputtype == "file")
            whatsValid.inputfile = !(!this.state.inputfile)

        // check if cipher was selected
        if(this.state.method == "cipher")
            whatsValid.cipher = this.props.cipherList.includes(this.state.cipher)

        // check if key was selected
        if(this.state.method == "key")
            whatsValid.key = !(!this.state.key)

        // only use passphrase for ciphers and decryption with encrypted private keys
        if(this.state.method == "cipher" || (this.state.mode == "decrypt" && this.isPrivateKeyEncrypted)) {

            // check if passphrase text is valid
            if(this.state.passphrasetype == "text")
                whatsValid.passphrasetext = !(!this.state.passphrasetext)

            // check if passphrase file is valid
            if(this.state.passphrasetype == "file")
                whatsValid.passphrasefile = !(!this.state.passphrasefile)

        }

        // check if output file is valid
        if(this.state.useoutputfile == "true")
            whatsValid.outputfile = !(!(this.state.outputfile || "").trim())

        return whatsValid

    }

    _buildCommand(whatsValid = {}) {

        if(Object.values(whatsValid).includes(false)) return i18next.t("Please fill in all fields")

        let command = "openssl"

        if(this.state.method == "cipher") {
            command += " enc -" + this.state.cipher
            if(this.state.mode == "encrypt") command += " -e"
            if(this.state.mode == "decrypt") command += " -d"
        }

        if(this.state.method == "key") {
            command += " pkeyutl"

            if(this.state.mode == "encrypt") {
                command += " --encrypt"
                command += " -pubin -inkey " + this.state.key
            }

            if(this.state.mode == "decrypt") {
                command += " --decrypt"
                command += " -inkey " + this.state.key

                if(this.isPrivateKeyEncrypted) {

                    if(this.state.passphrasetype == "text")
                        command += " -passin pass:" + this.state.passphrasetext

                    if(this.state.passphrasetype == "file")
                        command += " -passin file:" + this.state.passphrasefile
                }
            }
        }

        if(this.state.inputtype == "text")
            command = "echo " + this.state.inputtext + " | " + command

        if(this.state.inputtype == "file")
            command += " -in " + this.state.inputfile

        if(this.state.method == "cipher") {

            if(this.state.passphrasetype == "text")
                command += " -k " + this.state.passphrasetext

            if(this.state.passphrasetype == "file")
                command += " -kfile " + this.state.passphrasefile

            if(this.state.pbkdf2 == "true")
                command += " -pbkdf2"

            if(this.state.salt != "true")
                command += " -nosalt"

            if(this.state.base64 == "true")
                command += " -a"

        }

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
