import React from "react"
import ReactDOM from "react-dom"

import CommandLine from "./sources/OpenSSL_CommandLine"

import "./static/style.css"

// set global base url (index and payload paths differ in cto)
window.baseUrl = window.CTO_Globals?.pluginRoot // try cto first
|| location.href.replace(location.pathname.split("/").slice(-1), "")
if(window.baseUrl.slice(-1) != "/") window.baseUrl += "/"

// initialize command line component
ReactDOM.render(<CommandLine />, document.getElementById("commandline"))
