import React from "react"
import { Trans } from "react-i18next"

import Button from "react-bootstrap/Button"
import FormControl from "react-bootstrap/FormControl"
import InputGroup from "react-bootstrap/InputGroup"

class CommandField extends React.Component {

    render() {
        return (

            <InputGroup>
                <InputGroup.Prepend>
                    <InputGroup.Text><Trans>Command</Trans>:</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl value={this.props.command} disabled style={{fontFamily: "monospace"}} />
                <InputGroup.Append>
                    <Button onClick={() => this.onClickRunButton()} disabled={!this.props.enableRun}>
                        <i className="fa fa-play"></i> <Trans>Run</Trans>
                    </Button>
                </InputGroup.Append>
            </InputGroup>

        )
    }

    onClickRunButton() {
        this.props.runCommand(this.props.command)
    }

}

export default CommandField
