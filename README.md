## Welcome to Floorp Browser GitHub Repository 👋

[![Contributors](https://img.shields.io/github/contributors/Floorp-Projects/Floorp.svg?style=for-the-badge)](https://github.com/Floorp-Projects/Floorp/graphs/contributors)
[![Forks](https://img.shields.io/github/forks/Floorp-Projects/Floorp?style=for-the-badge)](https://github.com/Floorp-Projects/Floorp/network/members)
[![Stars](https://img.shields.io/github/stars/Floorp-Projects/Floorp.svg?style=for-the-badge)](https://github.com/Floorp-Projects/Floorp/stargazers)
[![Issues](https://img.shields.io/github/issues/Floorp-Projects/Floorp.svg?style=for-the-badge)](https://github.com/Floorp-Projects/Floorp/issues)
[![Crowdin](https://badges.crowdin.net/floorp-browser/localized.svg)](https://crowdin.com/project/floorp-browser)

<p align="center">
  <img src="https://avatars.githubusercontent.com/u/94953125?s=200&v=4" alt="Logo" width="150">
  <h3 align="center">Floorp Browser</h3>
  <p align="center">A Browser built for keeping the Open, Private and Sustainable Web alive. Based on Mozilla Firefox.
  </p>
  <p align="center">
    <a href="https://floorp.app">Official Site</a>
    ・
    <a href="#-download">Download</a>
    ・
    <a href="https://blog.ablaze.one/category/ablaze/ablaze-project/floorp/">Blog & Release Notes</a>
    ・
    <a href="https://support.ablaze.one">Official Support Site & Send feedback</a>
    ・
    <a href="https://docs.floorp.app">Documentation</a>
  </p>
</p>

## 🔥 Overview

Floorp is an open-source browser based on Mozilla Firefox that focuses on privacy, customization, and performance. It includes additional features not found in standard Firefox while maintaining compatibility with Firefox extensions.

## 💰 Sponsorship

Floorp Browser is free and open-source. Your sponsorship helps with development and server costs.

- [GitHub Sponsors](https://github.com/sponsors/Ablaze-MIRAI)
- Sponsors who contribute $100+ monthly are eligible for advertising opportunities

<h2>💕 Special Sponsors</h2>
<div align="left" style="display: flex; flex-wrap: wrap;">
  <a href="https://www.cube-soft.jp/" style="margin: 10px; overflow: hidden; padding: 0px 30px;">
    <img src="https://avatars.githubusercontent.com/u/346808?s=200&v=4" alt="CubeSoft, Inc." width="100" height="100">
    <h4 style="text-align: center;">CubeSoft, Inc.</h4>
  </a>
</div>


## 💻 System Requirements

### Windows

- Windows 10 or later
- x86_64 CPU architecture
- Install options:
  - Installer (exe)
  - Winget: `winget install Ablaze.Floorp`

### macOS

- macOS 10.15 or later
- x86_64 or ARM64 CPU
- Install options:
  - DMG installer
  - Homebrew: `brew install --cask floorp`

### Linux

- x86_64 or AArch64 CPU
- Distribution packages:
  - PPA: `https://ppa.floorp.app`
  - Flatpak: `https://flathub.org/apps/one.ablaze.floorp`
  - AUR: `floorp-bin` or `floorp`
  - Tarball available

## 📥 Download

- [Official Website](https://floorp.app/download)
- [GitHub Releases](https://github.com/Floorp-Projects/Floorp-12/releases)

## 🧰 Development

### Getting Started

1. Run `pnpm install`
2. Run `pnpm build` to build or `pnpm dev` for debugging

### Debugging

#### Windows

1. Install [GitHub CLI](https://cli.github.com/)
2. Visit [noraneko-runtime Action](https://github.com/nyanrus/noraneko-runtime/actions/workflows/wrapper_windows_build.yml)
3. Go to latest successful build and check the id in url. This is the run_id (a number). The `Release` version is recommended.
4. Download the runtime:
   ```
   gh run download -R nyanrus/noraneko-runtime -n noraneko-win-amd64-dev [run_id]
   ```
5. Run `pnpm dev`

#### Linux

1. Install GitHub CLI and lbzip2
2. Visit [noraneko-runtime Action](https://github.com/nyanrus/noraneko-runtime/actions/workflows/wrapper_linux_build.yml)
3. Go to latest successful build and check the id in url. This is the run_id (a number).
4. Download the runtime:
   ```
   gh run download -R nyanrus/noraneko-runtime -n noraneko-linux-amd64-dev [run_id]
   mkdir -p _dist/bin
   tar --strip-components=1 -xvf ./noraneko-*.tar.bz2 -C _dist/bin
   ```
5. Run `pnpm dev`

## 🐛 Bug Reporting

Found a bug? Report it on our [Issues page](https://github.com/Floorp-Projects/Floorp-12/issues).

## 📄 License

Floorp is licensed under the [Mozilla Public License 2.0](https://www.mozilla.org/en-US/MPL/2.0/).

## ⚖️ Legal Information

- Floorp name and logo are protected by copyright
- Floorp is based on Mozilla Firefox but is not affiliated with Mozilla

## 📧 Contact

- [Official Floorp Twitter](https://twitter.com/Floorp_Browser) or [Official Ablaze Twitter](https://twitter.com/Ablaze_MIRAI)
- [Official Ablaze Community Discord Server](https://discord.com/invite/f8NFWjx6Rt)
- [Official Support Site](https://support.ablaze.one)

## 📖 Documentation

Detailed information can be found in our [Documentation](https://docs.floorp.app).

## 📜 Privacy Policies

- [Ablaze Privacy Policy](https://docs.ablaze.one/privacy_policy)
- [Floorp Privacy Policy](https://docs.ablaze.one/floorp_privacy_policy)

## 🛠️ Open Source Components

Floorp uses code from several open source projects, including:

- Mozilla Firefox by [Mozilla & Contributors](https://www.mozilla.org/credits/) ([MPL 2.0](https://www.mozilla.org/en-US/MPL/2.0/)) - [Repository](https://github.com/mozilla/gecko-dev)
- Noraneko by [NyanRus](https://github.com/nyanrus) ([MPL 2.0](https://github.com/nyanrus/noraneko-runtime/blob/main/LICENSE)) - [Repository](https://github.com/nyanrus/noraneko-runtime)
- Firefox UI FIX (Lepton) by [black7375](https://github.com/black7375) ([MPL 2.0](https://github.com/black7375/Firefox-UI-Fix/blob/master/LICENSE)) - [Repository](https://github.com/black7375/Firefox-UI-Fix)
- userChromeCSS Loader by Griever ([MIT](floorp/browser/base/content/browser-chromeCSS.js))
- Paxmod by [numirias](https://github.com/numirias/) ([MIT](https://github.com/numirias/paxmod/blob/master/LICENSE)) - [Repository](https://github.com/numirias/paxmod)
- showdown by [SyntaxRules](https://github.com/SyntaxRules) ([MIT](https://github.com/showdownjs/showdown/blob/master/LICENSE)) - [Repository](https://github.com/showdownjs/showdown)
- Fushra Pulse by [Fushra](https://github.com/Fushra) ([MPL 2.0](https://github.com/pulse-browser/browser/blob/main/LICENSE)) - [Repository](https://github.com/pulse-browser/browser)

## 📊 Repository View Counter

<div align='center'><a href='https://www.websitecounterfree.com'><img src='https://www.websitecounterfree.com/c.php?d=9&id=38248&s=1' border='0' alt='Free Website Counter'></a><br/><small>
<a href='https://www.websitecounterfree.com'>Free Website Counter: Since 2023 7/22</a></small></div>
