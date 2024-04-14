# Dev Docs

this is a [Electron](https://www.electronjs.org/) project bootstrapped with [Electron React Boilerplate.
](https://github.com/electron-react-boilerplate/electron-react-boilerplate)

in a nutshell its a GUI that interacts with [warp-plus](https://github.com/bepass-org/warp-plus/) binary file and uses [tun2socks](https://github.com/xjasonlyu/tun2socks) to tunnel all OS traffic through the socks5 proxy that warp-plus creates. and makes sure it's run on three main Desktop Operating Systems.

## Getting Started

1. clone this repo

2. install packages and run

```shell
npm install
npm run dev # or npm start
```

## Packaging for Production

To package for the local platform:

```shell
npm run package
```
