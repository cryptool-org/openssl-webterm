/**
 * React wrapper for xterm.js
 * Taken from https://github.com/robert-harbison/xterm-for-react
 */


import * as React from 'react'
import PropTypes from 'prop-types'

import 'xterm/css/xterm.css'

// We are using these as types.
// eslint-disable-next-line no-unused-vars
import { Terminal, ITerminalOptions, ITerminalAddon } from 'xterm'

export default class Xterm extends React.Component {
	/**
	 * The ref for the containing element.
	 */
	terminalRef

	/**
	 * XTerm.js Terminal object.
	 */
	terminal // This is assigned in the setupTerminal() which is called from the constructor

	static propTypes = {
		className: PropTypes.string,
		options: PropTypes.object,
		addons: PropTypes.array,
		onBinary: PropTypes.func,
		onCursorMove: PropTypes.func,
		onData: PropTypes.func,
		onKey: PropTypes.func,
		onLineFeed: PropTypes.func,
		onScroll: PropTypes.func,
		onSelectionChange: PropTypes.func,
		onRender: PropTypes.func,
		onResize: PropTypes.func,
		onTitleChange: PropTypes.func,
		customKeyEventHandler: PropTypes.func,
	}

	constructor(props) {
		super(props)

		this.terminalRef = React.createRef()

		// Bind Methods
		this.onData = this.onData.bind(this)
		this.onCursorMove = this.onCursorMove.bind(this)
		this.onKey = this.onKey.bind(this)
		this.onBinary = this.onBinary.bind(this)
		this.onLineFeed = this.onLineFeed.bind(this)
		this.onScroll = this.onScroll.bind(this)
		this.onSelectionChange = this.onSelectionChange.bind(this)
		this.onRender = this.onRender.bind(this)
		this.onResize = this.onResize.bind(this)
		this.onTitleChange = this.onTitleChange.bind(this)

		this.setupTerminal()
	}

	setupTerminal() {
		// Setup the XTerm terminal.
		this.terminal = new Terminal(this.props.options)

		// Load addons if the prop exists.
		if (this.props.addons) {
			this.props.addons.forEach((addon) => {
				this.terminal.loadAddon(addon)
			})
		}

		// Create Listeners
		this.terminal.onBinary(this.onBinary)
		this.terminal.onCursorMove(this.onCursorMove)
		this.terminal.onData(this.onData)
		this.terminal.onKey(this.onKey)
		this.terminal.onLineFeed(this.onLineFeed)
		this.terminal.onScroll(this.onScroll)
		this.terminal.onSelectionChange(this.onSelectionChange)
		this.terminal.onRender(this.onRender)
		this.terminal.onResize(this.onResize)
		this.terminal.onTitleChange(this.onTitleChange)

		// Add Custom Key Event Handler
		if (this.props.customKeyEventHandler) {
			this.terminal.attachCustomKeyEventHandler(this.props.customKeyEventHandler)
		}
	}

	componentDidMount() {
		if (this.terminalRef.current) {
			// Creates the terminal within the container element.
			this.terminal.open(this.terminalRef.current)
		}
	}

	componentWillUnmount() {
		// When the component unmounts dispose of the terminal and all of its listeners.
		this.terminal.dispose()
	}

	onBinary(data) {
		if (this.props.onBinary) this.props.onBinary(data)
	}

	onCursorMove() {
		if (this.props.onCursorMove) this.props.onCursorMove()
	}

	onData(data) {
		if (this.props.onData) this.props.onData(data)
	}

	onKey(event) {
		if (this.props.onKey) this.props.onKey(event)
	}

	onLineFeed() {
		if (this.props.onLineFeed) this.props.onLineFeed()
	}

	onScroll(newPosition) {
		if (this.props.onScroll) this.props.onScroll(newPosition)
	}

	onSelectionChange() {
		if (this.props.onSelectionChange) this.props.onSelectionChange()
	}

	onRender(event) {
		if (this.props.onRender) this.props.onRender(event)
	}

	onResize(event) {
		if (this.props.onResize) this.props.onResize(event)
	}

	onTitleChange(newTitle) {
		if (this.props.onTitleChange) this.props.onTitleChange(newTitle)
	}

	render() {
		return <div className={this.props.className} ref={this.terminalRef} />
	}
}