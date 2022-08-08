# <img height="48" src="https://www.cryptool.org/assets/cto/plugin-icons/openssl.svg" valign="middle"> OpenSSL Webterm

User-friendly web app to use OpenSSL, based on WebAssembly. OpenSSL v3 has been compiled with Emscripten to run in a terminal/tty emulator in the browser. See the [Live Demo](https://www.cryptool.org/cto/openssl). You could also [host this on your own machine](#installation).

We then built a graphical user interface (GUI) on top of that, so it's easy for newbies to operate. Your actions in the GUI are transformed to original OpenSSL commands on the command line, so you easily can learn their syntax.

> **Disclaimer**: This tool is intended for teaching and educational purposes. It was developed in 2021 by the [CrypTool project](https://www.cryptool.org) in order to run OpenSSL v3 in a browser. You can also look at [its predecessor](https://github.com/janeumnn/openssl-webapp).

![image](https://user-images.githubusercontent.com/9321076/157410455-686ce0de-335f-4335-a639-07b6963e4589.png)


## Installation

First, [install Node.js and npm](https://nodejs.org). Then clone this project and install its dependencies:

```shell
$ git clone https://github.com/cryptool-org/openssl-webterm.git
$ cd openssl-webterm
$ npm install
```

Then start a Webpack development server:

```shell
$ npm run serve
```

You can now view the OpenSSL Webterm at https://localhost:4200.


## Internal workings

The React GUI just builds commands (as strings). These are then called upon the terminal, which is an instance of [wasm-webterm](https://github.com/cryptool-org/wasm-webterm). If your browser supports WebWorkers (including SharedArrayBuffers and Atomics), a new Worker thread is spawned and the WebAssembly binary ([`openssl.wasm`](/emscr/binary/openssl.wasm)) is ran there. Otherwise, it is executed on the main browser thread using a fallback (which can freeze the tab).

The WebAssembly binary is executed using the (auto generated) Emscripten JS runtime contained in [`openssl.js`](/emscr/binary/openssl.js). It initializes a virtual memory filesystem and handles input/output calls.

If the binary asks for input (reads from `/dev/stdin`), the thread will be paused until the user entered something. If the binary prints to `/dev/stdout` or `/dev/stderr`, it will be shown on the [xterm.js](https://github.com/xtermjs/xterm.js) web terminal.

After each command, the files in the memory filesystem are gathered and passed to the React GUI.


## Compiling OpenSSL

First, [install the Emscripten SDK](https://emscripten.org/docs/getting_started/downloads.html). You can then easily recompile the OpenSSL WebAssembly binary by calling the following command. Note that this is not neccessary, as [it's already compiled](/emscr/binary).

```shell
$ npm run build:openssl
```

This will call the script in [`emscr/builds/openssl/build.sh`](/emscr/builds/openssl/build.sh). It fetches the OpenSSL sources as a `.tar.gz` archive from https://www.openssl.org/source and extracts it. It then compiles them with Emscripten by calling `emconfigure` and `emmake` (both with specific flags).

The created files `openssl.wasm` and `openssl.js` are then copied into `emscr/binary`, where the webpack server will deliver them from.


## Docker Integration

The source code contains a [`Dockerfile`](/Dockerfile) which allows you to create ready-to-run [Docker](https://www.docker.com) images. These are comparable to snapshots in virtual machines.

First, [install and start Docker](https://docs.docker.com/get-docker). Then create a Docker image:

```shell
$ docker build -t openssl-webterm .
```

> This installs [Alpine Linux](https://www.alpinelinux.org) with Node.js (v16.3) and [nginx](https://github.com/nginx/nginx) into a virtual image, builds the OpenSSL Webterm sources, and copies the built files into nginx's web server directory.

You can then instanciate this image into a Docker container:

```shell
$ docker run --rm -it -p 4300:80 -d openssl-webterm
```

> This runs the nginx web server.

You should now be able to view the OpenSSL Webterm at http://localhost:4300


## Contributing

Any contributions are **greatly appreciated**. If you have a suggestion that would make this better, please open an issue or fork the repository and create a pull request.

## License

[Apache License v2](http://www.apache.org/licenses/)
This mainly requests to keep the name of the original authors and give according credit to them if you change or redistribute the sources.
