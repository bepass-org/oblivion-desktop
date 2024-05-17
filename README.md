# Oblivion Desktop

Unofficial Desktop version of [oblivion](https://github.com/bepass-org/oblivion)

Oblivion provides secure, optimized internet access through a user-friendly Windows/Mac/Linux app using cloudflare warp
technology

<b>"Internet, for all or none!"</b>

[![Version](https://img.shields.io/github/package-json/v/bepass-org/oblivion-desktop?label=Version&color=blue)](https://github.com/bepass-org/oblivion-desktop/releases/latest)
[![Download](https://img.shields.io/github/downloads/bepass-org/oblivion-desktop/total?label=Downloads)](https://github.com/bepass-org/oblivion-desktop/releases/latest)
[![Stars](https://img.shields.io/github/stars/bepass-org/oblivion-desktop?style=flat&label=Stars&color=tomato
)](https://github.com/bepass-org/oblivion-desktop)
[![License](https://img.shields.io/badge/License-Restrictive-f84e29.svg?color=white)](LICENSE.md)

![oblivion.png](screenshot/oblivion.png)

## Features

- **Secure VPN**: Custom WireGuard implementation in Go.
- **User-Friendly**: Simple, intuitive interface.

![oblivion.jpg](screenshot/oblivion.jpg)

## Quick Overview

<div align=left>
<table>
    <thead align=left>
        <tr>
            <th>Feature</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody align=left>
        <tr>
            <td>Method</td>
            <td>
                :white_check_mark:  Warp & Warp+ <br>
                :white_check_mark:  Gool<br>
                :white_check_mark:  Cfon <small>(Psiphon)</small>
            </td>
        </tr>
        <tr>
            <td>Network Configuration</td>
            <td>
                :white_check_mark: Proxy(No Change)<br>
                :white_check_mark: System Proxy<br>
                :white_large_square: TUN
            </td>
        </tr>
        <tr>
            <td>Routing Rules</td>
            <td>
                :white_large_square: GeoIP
            </td>
        </tr>
        <tr>
            <td>System Tray</td>
            <td>
                :white_check_mark:  Minimize<br>
                :white_large_square: Shortcuts<br>
                :white_large_square: BootUp
            </td>
        </tr>
        <tr>
            <td>Languages</td>
            <td>
                :white_check_mark:  Persian (Farsi) <br>
                :white_check_mark:  English <br>
                :white_check_mark:  Chinese <br>
                :white_check_mark:  Russian
            </td>
        </tr>
        <tr>
            <td>Theme</td>
            <td>
                :white_check_mark: Light<br>
                :white_check_mark: Dark<br>
                :white_check_mark: RTL<br>
                :white_check_mark: LTR<br>
                :white_large_square: Auto
            </td>
        </tr>
        <tr>
            <td>Other</td>
            <td>
                :white_large_square: SpeedTest<br>
                :white_large_square: Inline Update<br>
                :white_large_square: Accessibility
            </td>
        </tr>
    </tbody>
    </table>
</div>

## Download

<div align=left>
<table>
    <thead align=left>
        <tr>
            <th>OS</th>
            <th>Download</th>
            <th>Compatibility</th>
        </tr>
    </thead>
    <tbody align=left>
        <tr>
            <td>Windows</td>
            <td>
                <a href="https://github.com/bepass-org/oblivion-desktop/releases/download/v0.2.52-beta/oblivion-desktop-win-x64.exe"><img src="https://img.shields.io/badge/Setup-x64-2d7d9a.svg?logo=windows"></a><br>
                <a href="https://github.com/bepass-org/oblivion-desktop/releases/download/v0.2.52-beta/oblivion-desktop-win-x64.zip"><img src="https://img.shields.io/badge/Portable-x64-67b7d1.svg?logo=windows"></a>
            </td>
            <td>
                v10 x64<br>
                v11 x64
            </td>
        </tr>
        <tr>
            <td>macOS</td>
            <td>
                <a href="https://github.com/bepass-org/oblivion-desktop/releases/latest/download/oblivion-desktop-mac-arm64.dmg"><img src="https://img.shields.io/badge/DMG-arm64-ea005e.svg?logo=apple"></a><br>
                <a href="https://github.com/bepass-org/oblivion-desktop/releases/latest/download/oblivion-desktop-mac-x64.dmg"><img src="https://img.shields.io/badge/DMG-x64-ea005e.svg?logo=apple"></a><br>
                <a href="https://github.com/bepass-org/oblivion-desktop/releases/latest/download/oblivion-desktop-mac-arm64.pkg"><img src="https://img.shields.io/badge/PKG-arm64-bc544b.svg?logo=apple" /></a><br>
                <a href="https://github.com/bepass-org/oblivion-desktop/releases/latest/download/oblivion-desktop-mac-x64.pkg"><img src="https://img.shields.io/badge/PKG-x64-bc544b.svg?logo=apple" /></a><br>
            </td>
            <td></td>
        </tr>
        <tr>
            <td>Linux</td>
            <td>                
                <small>Coming Soon ...</small>
            </td>
            <td></td>
        </tr>
        <tr>
        <td>Android</td>
            <td>
                <a href="https://github.com/bepass-org/oblivion/releases/latest"><img src="https://img.shields.io/badge/APK-Universal-044d29.svg?logo=android"></a><br>
<a href="https://play.google.com/store/apps/details?id=org.bepass.oblivion"><img src="https://img.shields.io/badge/APK-Universal-044d29.svg?logo=googleplay"></a>
            </td>
            <td>v6+</td>
        </tr>
        <tr>
            <td>iOS</td>
            <td>
                <small>Coming Soon ...</small>
            </td>
            <td></td>
        </tr>
    </tbody>
</table>
</div>

## Get Involved

We're a community-driven project, aiming to make the internet accessible for all. Whether you want to contribute code,
suggest features, or need some help, we'd love to hear from you! Check out
our [GitHub Issues](https://github.com/bepass-org/oblivion-desktop/issues) or submit a pull request.

[![Stargazers over time](https://starchart.cc/bepass-org/oblivion-desktop.svg?variant=adaptive&background=%23FFFFFF&axis=%23333333&line=%23ffb300)](https://starchart.cc/bepass-org/oblivion-desktop)

## Know more

* [FAQ.md](FAQ.md)
* [License.md](LICENSE.md)
* [SECURITY.md](SECURITY.md)
* [DOCS.md](DOCS.md)

![virustotal.jpg](screenshot/virustotal.jpg)

## Acknowledgements

This project stands on the shoulders of giants, and we are deeply grateful for the contributions and inspiration
provided by the following repositories:

- Cloudflare Warp
- [warp-plus](https://github.com/bepass-org/warp-plus/) (Yousef Ghobadi & Mark Pashmfouroush)
- [oblivion](https://github.com/bepass-org/oblivion)
- [electron-react-boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate)
- [sing-box](https://github.com/SagerNet/sing-box)
- [hiddify-next](https://github.com/hiddify/hiddify-next)
- [and others 🧡](package.json)
