import React from "react"
import { Button, Card, Col, Form, Row } from "react-bootstrap"
import Helpers from "../Helpers"

class SignVerifyTab extends React.Component {

    constructor(props) {
        super(props)

        this.state = {

            /* default values */

            encdecFields: {
                mode: "encrypt"
            },

            signingFields: {

            },

            verifyFields: {

            }

        }
    }

    render() {

        // check if last select privkey is still available
        // todo: das allgemeiner lösen. hier hab ich zu viele select fields..

        // validate fields and build command for enc dec
        const whatsValidEncDec = {} // todo

        return <h1>Sign Verify</h1>

        return <Form onSubmit={e => e.preventDefault()}>

            <Card className="mt-4">
                <Card.Header className={"d-flex align-items-center justify-content-between"}>
                    <b>Encrypt and Decrypt</b>
                    <Button variant="dark" size="sm" onClick={() => this._resetEncDecFields()}>
                        <i className="fa fa-undo"></i> Reset fields
                    </Button>
                </Card.Header>
                <Card.Body>

                    <Form.Group>
                        <Form.Label className="d-inline-block mr-3">Mode:</Form.Label>
                        <Form.Check custom inline type="radio" name="mode" value="encrypt"
                            label="Encrypt" onChange={e => this._onEncDecFieldChange(e)}
                            id="keyutils-encdec-mode-encrypt" checked={this.state.mode == "encrypt"} />
                        <Form.Check custom inline type="radio" name="mode" value="decrypt"
                            label="Decrypt" onChange={e => this._onEncDecFieldChange(e)}
                            id="keyutils-encdec-mode-decrypt" checked={this.state.mode == "decrypt"} />
                    </Form.Group>

                    <Row>
                        <Col>

                            {this.state.encdecFields.mode == "encrypt" &&
                            <Form.Group>
                                <Form.Label>Public Key</Form.Label>
                                <Form.Control required as="select" value={this.state.encdecFields.pubkey}
                                    name="pubkey" onChange={e => this._onEncDecFieldChange(e)}
                                    isValid={whatsValidEncDec.pubkey} isInvalid={this._isInvalid(whatsValidEncDec.pubkey)}>
                                        <option key={0} value="">Select file</option>
                                        {Helpers.getPublicKeysFilenamesFromFiles(this.props.files).map(
                                            pubkey => <option key={pubkey} value={pubkey}>{pubkey}-bit</option>)}
                                </Form.Control>
                            </Form.Group>}

                            {this.state.encdecFields.mode == "decrypt" &&
                            <Form.Group>
                                <Form.Label>Private Key</Form.Label>
                                <Form.Control required as="select" value={this.state.encdecFields.privkey}
                                    name="privkey" onChange={e => this._onEncDecFieldChange(e)}
                                    isValid={whatsValidEncDec.privkey} isInvalid={this._isInvalid(whatsValidEncDec.privkey)}>
                                        <option key={0} value="">Select file</option>
                                        {Helpers.getPrivateKeysFilenamesFromFiles(this.props.files).map(
                                            privkey => <option key={privkey} value={privkey}>{privkey}-bit</option>)}
                                </Form.Control>
                            </Form.Group>}

                        </Col>
                        <Col>
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
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label>
                                    <Form.Check custom inline type="checkbox" name="useoutputfile" id="keyutils-encdec-useoutputfile"
                                        label="Output Private Key to file" value={(this.state.encdecFields.useoutputfile == "true" ? "false" : "true")}
                                        onChange={e => this._onEncDecFieldChange(e)} checked={this.state.encdecFields.useoutputfile == "true"} />
                                </Form.Label>
                                <Form.Control type="text" value={this.state.encdecFields.outputfile} name="outputfile"
                                    onChange={e => this._onEncDecFieldChange(e)} disabled={this.state.encdecFields.useoutputfile != "true"}
                                    isInvalid={this._isInvalid(whatsValidEncDec.outputfile)} isValid={whatsValidEncDec.outputfile} />
                            </Form.Group>
                        </Col>
                    </Row>

                    <hr style={{ marginTop: "0.5rem", marginBottom: "1.5rem" }} />
                    <CommandField command={privkeyCommand} runCommand={this.props.runCommand}
                        enableRun={!Object.values(whatsValidPriv).includes(false)} />

                </Card.Body>
            </Card>

        </Form>
    }


    /* helper functions */

    _isInvalid(value) {
        // make undefined not mean false
        if(value == undefined) return undefined
        else return !value
    }

}

export default SignVerifyTab
