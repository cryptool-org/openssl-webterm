#!/bin/bash

OPENSSL_VERSION="openssl-3.4.0"
OPENSSL_DIR="src"

if [ -d ${OPENSSL_DIR} ]; then
  rm -rf ${OPENSSL_DIR}
fi

if [ ! -f ${OPENSSL_VERSION}.tar.gz ]; then
  curl -O https://www.openssl.org/source/${OPENSSL_VERSION}/${OPENSSL_VERSION}.tar.gz
fi

mkdir ${OPENSSL_DIR}
tar xf ${OPENSSL_VERSION}.tar.gz --strip-components=1 --directory=${OPENSSL_DIR}
cd ${OPENSSL_DIR} || exit 1

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
  -s USE_ES6_IMPORT_META=0\
  -s ALLOW_MEMORY_GROWTH=1\
  --embed-file usr/local/ssl/openssl.cnf"

if [[ $1 == "debug" ]]; then
  LDFLAGS="$LDFLAGS -s ASSERTIONS=1" # For logging purposes.
fi

export LDFLAGS
export CC=emcc
export CXX=emcc

emconfigure ./Configure \
  no-hw \
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


# import wasm build
cp apps/openssl.js ../../../binary/openssl.js || exit 1
cp apps/openssl.wasm ../../../binary/openssl.wasm || exit 1
sed -i '1s;^;\/* eslint-disable *\/;' ../../../binary/openssl.js

# clean up directory
cd .. && rm -rf ${OPENSSL_DIR} ${OPENSSL_VERSION}.tar.gz
