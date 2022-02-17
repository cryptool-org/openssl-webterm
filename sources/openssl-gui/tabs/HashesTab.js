import React from "react"
import { Button, Col, Form, Row } from "react-bootstrap"
import CommandField from "../CommandField"

class HashesTab extends React.Component {

    /**
     * should get props:
     * files, hashfunList, runCommand
     */

    constructor(props) {
        super(props)

        this.state = {

            /* default values */
            inputtype: "text",
            inputtext: "Hello world",
            hashfun: "sha256",
            outputfile: "hashed.data"

        }

        // save initial state for reset (copy - no reference)
        this._initialState = JSON.parse(JSON.stringify(this.state))

        window.hashes = this // todo: debug

    }

    render() {

        // validate fields and build command
        const whatsValid = this._validateFields()
        const command = this._buildCommand(whatsValid)

        return <Form onSubmit={e => e.preventDefault()}>

            <Form.Group>

                <Form.Label>
                    <span className="mr-3">Input:</span>
                    <Form.Check custom inline type="radio" name="inputtype" value="text"
                        label="Text" onChange={e => this.onChange(e)} id="hashes-inputtype-text"
                        checked={this.state.inputtype == "text"} />
                    <Form.Check custom inline type="radio" name="inputtype" value="file"
                        label="File" onChange={e => this.onChange(e)} id="hashes-inputtype-file"
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
                        <Form.Label>Hash function</Form.Label>
                        <Form.Control as="select" value={this.state.hashfun} name="hashfun" onChange={e => this.onChange(e)}
                            isInvalid={this._isInvalid(whatsValid.hashfun)} isValid={whatsValid.hashfun}>
                                {this.props.hashfunList.map(hashfun => <option key={hashfun} value={hashfun}>{hashfun}</option>)}
                        </Form.Control>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group>
                        <Form.Label>
                            <Form.Check custom inline type="checkbox" name="useoutputfile" id="hashes-useoutputfile"
                                label="Output to file" value={(this.state.useoutputfile == "true" ? "false" : "true")}
                                onChange={e => this.onChange(e)} checked={this.state.useoutputfile == "true"} />
                        </Form.Label>
                        <Form.Control type="text" value={this.state.outputfile} name="outputfile"
                            onChange={e => this.onChange(e)} disabled={this.state.useoutputfile != "true"}
                            isInvalid={this._isInvalid(whatsValid.outputfile)} isValid={whatsValid.outputfile} />
                    </Form.Group>
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

        // check if hash fun was selected
        whatsValid.hashfun = !(!this.state.hashfun)

        // check if output file is valid
        if(this.state.useoutputfile == "true") {
            whatsValid.outputfile = !(!(this.state.outputfile || "").trim())
        } else whatsValid.outputfile = undefined

        return whatsValid

    }

    _buildCommand(whatsValid = {}) {

        if(Object.values(whatsValid).includes(false)) return "Please fill out the form completely"

        let command = "openssl dgst"

        command += " -" + this.state.hashfun

        if(this.state.useoutputfile == "true")
            command += " -out " + this.state.outputfile

        if(this.state.inputtype == "text")
            command = "echo " + this.state.inputtext + " | " + command

        if(this.state.inputtype == "file")
            command += " " + this.state.inputfile

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

export default HashesTab
