#!/bin/bash

OPENSSL_VERSION="openssl-3.6.0"

FILENAME="$OPENSSL_VERSION.tar.gz"
DOWNLOAD_PATH="https://github.com/openssl/openssl/releases/download/$OPENSSL_VERSION/$FILENAME"

OPENSSL_DIR="src"

if [ -d ${OPENSSL_DIR} ]; then
  rm -rf ${OPENSSL_DIR}
fi

if [ ! -f ${FILENAME} ]; then
  echo Downloading from ${DOWNLOAD_PATH} $'\n'
  curl -L -O ${DOWNLOAD_PATH}
fi

mkdir ${OPENSSL_DIR}
echo Extracting tar archive ${FILENAME} $'\n'
tar xf ${FILENAME} --strip-components=1 --directory=${OPENSSL_DIR}
cd ${OPENSSL_DIR} || exit 1

echo Apply patches $'\n'
patch -p1 -i ../speed_sched.patch
echo ''

echo Copying OpenSSL config $'\n'
mkdir -p usr/local/ssl/
cp ../openssl.cnf usr/local/ssl/openssl.cnf

LDFLAGS="\
  -s ENVIRONMENT='web'\
  -s FILESYSTEM=1\
  -s MODULARIZE=1\
  -s EXPORTED_RUNTIME_METHODS=\"['callMain', 'FS', 'TTY']\"\
  -s INVOKE_RUN=0\
  -s EXIT_RUNTIME=1\
  -s EXPORT_ES6=0\
  -s EXPORT_NAME='EmscrJSR_openssl'\
  -s ALLOW_MEMORY_GROWTH=1\
  --embed-file usr/local/ssl/openssl.cnf"

if [[ $1 == "debug" ]]; then
  LDFLAGS="$LDFLAGS -s ASSERTIONS=1" # For logging purposes.
fi

export LDFLAGS
export CC=emcc
export CXX=emcc

echo Running Emscripten $'\n'

emconfigure ./Configure \
  no-shared \
  no-asm \
  no-threads \
  no-ssl3 \
  no-dtls \
  no-engine \
  no-dso \
  linux-x32 \
  -static\

sed -i 's/$(CROSS_COMPILE)//' Makefile
emmake make -j 16 build_generated libssl.a libcrypto.a apps/openssl
mv apps/openssl apps/openssl.js

echo Copying OpenSSL binary into emscr/binary folder

# import wasm build
cp apps/openssl.js ../../../binary/openssl.js || exit 1
cp apps/openssl.wasm ../../../binary/openssl.wasm || exit 1
sed -i '1s;^;\/* eslint-disable *\/;' ../../../binary/openssl.js

# clean up directory
cd .. && rm -rf ${OPENSSL_DIR} ${FILENAME}
