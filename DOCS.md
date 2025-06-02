# DEVELOPER DOCUMENTATION

Oblivion Desktop is an [Electron](https://www.electronjs.org/) project bootstrapped with [Electron React Boilerplate.
](https://github.com/electron-react-boilerplate/electron-react-boilerplate)

In a nutshell, Oblivion Desktop is a GUI program that interacts with "[WARP-Plus](https://github.com/bepass-org/warp-plus/)"'s binary executable and changes the system's proxy settings.

<!-- and [sing-box](https://sing-box.sagernet.org/alig) binaries. -->

## Getting Started

1. Make sure you have [Node.js](https://nodejs.org/) and [NPM](https://www.npmjs.com/) installed on your system.

2. Clone this repository (`$ git clone https://github.com/bepass-org/oblivion-desktop.git`)

3. Install the program's dependencies:

```shell
npm install
```

4. Run the development server:

```shell
npm run dev # or npm start
```

## Packaging for Production (build from the source)

To package for your local platform:

```shell
npm run package
```

for faster production build (test purposes) use one of the following:

```shell
npm run package:linux
npm run package:windows
npm run package:mac
```

When the command(s) finish, you are to have your production build(s) at `release/build`!

for more specific builds checkout: https://www.electron.build/cli
For more specific builds, take a look at [this](https://electron.build/cli)!

## IPC (sending data between main and renderer)

as you may be familiar with electron already.  
As you are probably familiar with [Electron](https://electron.build/) already;
We need to use [IPC](https://www.electronjs.org/docs/latest/tutorial/ipc) in order to send and receive data between main and renderer.  
Take a loot at `src/main/ipc.ts` and `src/renderer/index.tsx` for an in-action example.

# Codebase Terminology

For clarity when working with the TypeScript codebase:

### Dependencies

After Warp-Plus (wp) updates, always refresh dependencies:

```bash
npm install
Code Abbreviations
```

<b>wp:</b> WARP-Plus module (Cloudflare integration)

<b>od:</b> Oblivion Desktop core functionality

<b>hp:</b> OblivionHelper utility package

<b>TypeScript Conventions</b>

- All abbreviations should be typed explicitly:

```ts
interface WpConfig { /* Warp-plus settings */ }
type OdState = /* OblivionDesktop state */;
Avoid inline abbreviations - use proper type aliases
```

- Document abbreviations in JSDoc:

```ts
/** @param wpConfig - Warp-plus configuration object */
Maintenance;
```

The project uses:

Strict TypeScript (strict: true)

Consistent ESLint rules

Pre-commit type checking## Notes

- (After WP updates;) to get the latest WP version, that app is using. run: `npm i`.
- `wp` refers to `warp-plus` in the source code.
- `od` refers to `oblivion desktop` in the source code.
- `hp` refers to `oblivion helper` in the source code.

Note: On Linux/MacOS, configuration files for the program are in `~/.config/oblivion-desktop` (that's `/home/user/.config/oblivion-desktop` as realpath) - **do not touch these files.**

Happy hacking! 😉
