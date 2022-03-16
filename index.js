import React from "react"
import ReactDOM from "react-dom"

import "./sources/translations"
import CommandLine from "./sources/OpenSSL_CommandLine"

import "./static/style.css"

// initialize command line component
ReactDOM.render(<CommandLine />, document.getElementById("commandline"))
