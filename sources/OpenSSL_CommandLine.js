import React from 'react';

import { Trans } from 'react-i18next';
import i18next from './translations';

import { XTerm } from 'xterm-for-react';
import WasmWebTerm from 'wasm-webterm';

import OpenSSLGUI from './openssl-gui/OpenSSL_GUI';
import { Button } from 'react-bootstrap';

class CommandLine extends React.Component {
  wasmTerm;

  constructor(props) {
    super(props);

    window.commandLine = this; // todo: debug

    // init wasm xterm addon (try cto url first)
    const baseUrl = window.CTO_Globals?.pluginRoot || './';
    this.wasmTerm = new WasmWebTerm(baseUrl + 'bin');

    // register api handlers for addon interaction
    this.wasmTerm.onFileSystemUpdate = (files) => this.setFiles(files);
    this.wasmTerm.onBeforeCommandRun = () => {
      if (!this.wasmTerm._worker)
        return new Promise(
          (
            resolve // using promise + timeout to show
          ) => {
            this.setLoading(i18next.t('executing command'), () => setTimeout(() => resolve(), 20));
          }
        );
    }; // the animation before gui freezes ^^
    this.wasmTerm.onCommandRunFinish = () => {
      if (!this.wasmTerm._worker) this.setLoading(false);
    };

    this.state = {
      loading: false,
      files: this.wasmTerm._wasmFsFiles,
      fullscreen: this.props.fullscreen || false,

      openSSL: {
        // internal data fetched from openssl
        curvesList: [],
        cipherList: [],
        hashfunList: [],
      },
    };

    // set custom openssl welcome message
    this.wasmTerm.printWelcomeMessage = () => {
      return new Promise((resolve) => {
        let welcomemessage = `\x1b[1;32m
 _ _ _     _      _____             _____ _____ __    \r
| | | |___| |_   |     |___ ___ ___|   __|   __|  |   \r
| | | | -_| . |  |  |  | . | -_|   |__   |__   |  |__ \r
|_____|___|___|  |_____|  _|___|_|_|_____|_____|_____|\r
                       |_|                            \r
                \x1b[37m\r`;

        this.wasmTerm
          .runWasmCommandHeadless('openssl', ['version'], null, (version) => {
            welcomemessage += '\r\n' + version.output + '\r';
            welcomemessage +=
              i18next.t('Compiled to WebAssembly with Emscripten') +
              '. ' +
              (this.wasmTerm._worker
                ? i18next.t('Running in WebWorker')
                : i18next.t('Worker not available')) +
              '.\r\n\r\n';
            welcomemessage += i18next.t('Usage: openssl [command] [params]') + '\r\n\r\n';

            resolve(welcomemessage); // continue execution flow
          })
          .catch((e) => console.error(i18next.t('error while') + ' printWelcomeMessage:', e));
      });
    };

    // init component values depending on openssl internals
    this.wasmTerm.onActivated = async () => {
      let curves = [];
      let ciphers = [];
      let hashes = [];

      // 1) fetch elliptic curves list from openssl
      const curvesList = await this.wasmTerm.runWasmCommandHeadless('openssl', [
        'ecparam',
        '-list_curves',
      ]);
      curvesList.stdout.split('\n').forEach((row) => {
        let name, description;
        let cols = row.split(':');

        if (cols.length == 0) return; // skip

        if (cols.length == 1) {
          // multiple lines description, append to last elem
          if (!curves[curves.length - 1]) return;
          curves[curves.length - 1].description =
            curves[curves.length - 1].description.trim() + ' ' + cols[0].trim();
        }

        if (cols.length > 1) {
          // name + description + x
          name = cols.shift().trim();
          description = cols.map((col) => col.trim()).join(' ');
          curves.push({ name: name, description: description });
        }
      });

      // 2) fetch encrypt decrypt ciphers list from openssl
      ciphers = (await this.wasmTerm.runWasmCommandHeadless('openssl', ['enc', '-list'])).stdout
        .split('\n')
        .slice(1)
        .map((x) => x.split(' ').filter((y) => y))
        .reduce((a, b) => a.concat(b), [])
        .map((x) => x.substring(1));

      // 3) fetch hash functions list from openssl
      hashes = (await this.wasmTerm.runWasmCommandHeadless('openssl', ['dgst', '-list'])).stdout
        .split('\n')
        .slice(1)
        .map((x) => x.split(' ').filter((y) => y))
        .reduce((a, b) => a.concat(b), [])
        .map((x) => x.substring(1));

      // sort the lists alphabetically
      curves.sort((a, b) => a.name.localeCompare(b.name));
      ciphers.sort((a, b) => a.localeCompare(b));
      hashes.sort((a, b) => a.localeCompare(b));

      // assign fetched values to component state
      this.setState({
        openSSL: Object.assign({}, this.state.openSSL, {
          curvesList: curves,
          cipherList: ciphers,
          hashfunList: hashes,
        }),
      });
    };
  }

  render() {
    return (
      <div className={'osslcmdline ' + (this.state.fullscreen ? 'fullscreen' : 'abovebelow')}>
        <div
          style={{ position: 'relative', width: this.state.fullscreen ? 'calc(50vw - 2.5px)' : '' }}
        >
          <XTerm addons={[this.wasmTerm]} options={{ fontSize: 15, fontFamily: 'monospace' }} />

          {this.state.loading && (
            <div className="loading">
              <i className="fa fa-spin fa-circle-o-notch fa-3x mt-1 mb-3"></i>
              <div className="small">{this.state.loading}</div>
            </div>
          )}
        </div>

        {this.state.fullscreen && (
          <div className="fullscreenresizer" onMouseDown={(e) => this._onFullscreenResize(e)}></div>
        )}

        <OpenSSLGUI
          files={this.state.files}
          setFiles={(files) => this.setFiles(files)}
          fullscreen={this.state.fullscreen}
          exitFullscreen={() => this.exitFullscreen()}
          runCommand={(line) => this.runCommandFromOpenSSLGUI(line)}
          cipherList={this.state.openSSL.cipherList}
          curvesList={this.state.openSSL.curvesList}
          hashfunList={this.state.openSSL.hashfunList}
        />

        {!this.state.fullscreen && (
          <div className="text-center">
            <Button variant="dark" onClick={() => this.enterFullscreen()}>
              <i className="fa fa-arrows-alt" /> &nbsp;<Trans>Enter split screen</Trans>
            </Button>

            {typeof CTO_Globals == 'undefined' && (
              <a
                className="btn btn-dark ml-2"
                href={'?lang=' + (window.lang == 'en' ? 'de' : 'en')}
              >
                <i className="fa fa-language" /> &nbsp;{window.lang == 'en' ? 'Deutsch' : 'English'}
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  componentDidUpdate(prevProps, prevState) {
    // resize on fullscreen mode change
    if (this.state.fullscreen != prevState.fullscreen) this.wasmTerm._xtermFitAddon.fit();

    return true; // render anyway
  }

  setLoading(value, callback) {
    // value is string or boolean
    if (value) this.setState({ loading: value }, callback);
    else this.setState({ loading: false }, callback);
  }

  setFiles(files) {
    this.wasmTerm._wasmFsFiles = files;
    this.setState(() => ({ files: this.wasmTerm._wasmFsFiles }));
    // state is passed as a function to use latest reference to wasmFsFiles
  }

  async runCommandFromOpenSSLGUI(line) {
    // only run one command at a time
    if (this.wasmTerm._isRunningCommand) return;

    // show command on terminal
    this.wasmTerm._xterm.write(line + '\r\n');

    // abort current repl
    this.wasmTerm._xtermEcho.abortRead('Everything is fine, running command from GUI');

    // add command to history
    this.wasmTerm._xtermEcho.history.push(line);

    // show loading animation
    await this.wasmTerm.onBeforeCommandRun();

    // execute line of commands
    await this.wasmTerm.runLine(line);

    // print newline after
    this.wasmTerm._xterm.write('\r\n');

    // hide loading animation
    await this.wasmTerm.onCommandRunFinish();

    // restart repl
    this.wasmTerm.repl();
  }

  _onFullscreenResize(e) {
    const x = e.clientX,
      y = e.clientY;
    const parentElem = e.target.parentNode;
    const leftElem = e.target.previousElementSibling;
    const leftWidth = leftElem.getBoundingClientRect().width;
    document.onmousemove = (e) => {
      const dx = e.clientX - x,
        dy = e.clientY - y;
      const newLeftWidth = ((leftWidth + dx) * 100) / parentElem.getBoundingClientRect().width;
      leftElem.style.width = newLeftWidth + '%';
      this.wasmTerm._xtermFitAddon.fit();
    };
    document.onmouseup = () => (document.onmousemove = document.onmouseup = null);
  }

  enterFullscreen() {
    this.setState({ fullscreen: true });
    document.getElementsByTagName('html')[0].style.overflow = 'hidden';
  }

  exitFullscreen() {
    this.setState({ fullscreen: false });
    document.getElementsByTagName('html')[0].style.overflow = '';
  }
}

export default CommandLine;
