import React from "react"
import ReactDOM from "react-dom"

import "./sources/translations"
import CommandLine from "./sources/OpenSSL_CommandLine"

import "./static/style.css"

// set global base url (index and payload paths differ in cto)
window.baseUrl = window.CTO_Globals?.pluginRoot // try cto first
|| window.location.href.split(/[?#]/)[0]

// adjust base url if needed
if(window.baseUrl.slice(-1) != "/") window.baseUrl += "/"

// initialize command line component
ReactDOM.render(<CommandLine />, document.getElementById("commandline"))
