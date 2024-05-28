# Dev Docs

this is a [Electron](https://www.electronjs.org/) project bootstrapped with [Electron React Boilerplate.
](https://github.com/electron-react-boilerplate/electron-react-boilerplate)

in a nutshell its a GUI that interacts with [warp-plus](https://github.com/bepass-org/warp-plus/) binary and changes system proxy setting.

## Getting Started

0. make sure you have [node](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.

1. clone this repo

2. install packages

```shell
npm install
```

3. run the development server

```shell
npm run dev # or npm start
```

## Packaging for Production (build from the source)

To package for the local platform:

```shell
npm run package
```

for faster production build (test purposes) use one of the following:

```shell
npm run package:linux
npm run package:windows
npm run package:mac
```

when commands finish you shall have your production build(s) at: `release/build`

## IPC (sending data between main and renderer)

as you may be familiar with electron already.  
we need to use [IPC](https://www.electronjs.org/docs/latest/tutorial/ipc) in order to send and receive data between main and renderer.  
checkout `src/main/ipc.ts` and `src/renderer/index.tsx` for an in action example.

## Notes

-   if you're wp binary is not updating! remove `warp-plus.zip` and run `npm i` again.
-   `wp` refers to `warp-plus` in source.
-   `od` refers to `oblivion desktop` in source.

happy hacking 😉
