import React from "react"

import Table from "react-bootstrap/Table"
import ButtonGroup from "react-bootstrap/ButtonGroup"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import InputGroup from "react-bootstrap/InputGroup"

class FilesTab extends React.Component {

    render() {

        return <>

        <Form className="my-3" onChange={e => this.onFileSelect(e)}>
            <InputGroup>
                <InputGroup.Prepend>
                    <InputGroup.Text><i className="fa fa-upload"></i></InputGroup.Text>
                </InputGroup.Prepend>
                <Form.File label="Select a file from your computer" custom />
            </InputGroup>
        </Form>

        <Table responsive className="mt-4 border">
            <thead className="thead-light">
                <tr>
                    <th>Filename</th>
                    <th>Last modified</th>
                    <th>File size</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {this.props.files.map(file => {

                    return <tr key={file.name}>
                        <td>{file.name}</td>
                        <td>{(new Date(file.timestamp)).toUTCString()}</td>
                        <td>{this._formatBytes(file.bytes.byteLength)}</td>
                        <td>
                            <ButtonGroup>
                                <Button variant="primary" size="sm"
                                    onClick={() => this.downloadFile(file.name)}>
                                    <i className="fa fa-download"></i>
                                </Button>
                                <Button variant="danger" size="sm"
                                    onClick={() => this.deleteFile(file.name)}>
                                    <i className="fa fa-trash-o"></i>
                                </Button>
                            </ButtonGroup>
                        </td>
                    </tr>

                })}
                {this.props.files.length == 0 && <tr><td>-</td><td>-</td><td>-</td><td>-</td></tr>}
            </tbody>
        </Table>

        </>

    }

    onFileSelect(event) {
        event.preventDefault()
        console.log("selected file from pc:", event.target.files[0])
        Array.from(event.target.files).forEach(file => {
            file.arrayBuffer().then(buffer => {
                const bytes = new Uint8Array(buffer)
                this.props.setFiles([...this.props.files, {
                    name: file.name,
                    timestamp: file.lastModified,
                    bytes: bytes
                }])
            })
        })
    }

    downloadFile(filename) {
        let file = this.props.files.find(file => file.name == filename)
        if(filename[0] == "/") filename = filename.substring(1)
        file = new File([file.bytes], file.name, {
            type: "application/octet-stream"
        })
        let url = window.URL.createObjectURL(file)
        let a = document.createElement("a")
        a.href = url
        a.download = filename
        a.click()
        window.URL.revokeObjectURL(url)
    }

    deleteFile(filename) {
        this.props.setFiles(this.props.files.filter(file => file.name != filename))
    }

    _formatBytes(bytes, decimals = 2) {
        if(bytes == 0) return "0 Bytes"
        const k = 1000 // alternative: 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
    }

}

export default FilesTab
