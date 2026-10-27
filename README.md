# VacooTube

<img src="assets/icon-master.png" width="144" alt="VacooTube — a glowing video lamp">

**A small screen. A long watchlist.**

VacooTube is a video-player project for **Switch 2 / NS2**, running on a Linux PC and controlled from the console through **IZ2S Platform** and **IZlauncher**. It uses a console/TV-style YouTube interface with touch and controller input.

**This is a fork of [VacuumTube](https://github.com/shy1132/VacuumTube), adapted for NS2 and IZ2S.** The application source is included in `app/`; original copyright/MIT terms are preserved in `app/LICENSE`, and source revision/changes are recorded in [THIRD_PARTY.json](THIRD_PARTY.json).

This is not a native standalone Switch executable, a new console connection engine or a console emulator. The desktop application executes on the PC; the existing console session presents its video/audio and supplies input.

## Streaming engine

VacooTube uses **BlitBun** as its streaming engine for frame encoding, packet compression and video/audio delivery to Switch 2. The required engine implementation is bundled inside VacooTube under `server/streaming/`; installing the separate BlitBun module is not required. Each project can be installed and updated independently. Cross-repository links will be added when the repositories are published.

## How it works

1. IZ2S establishes its normal console session and loads the module.
2. Opening VacooTube on Switch starts the owned PC application on demand.
3. The app creates an offscreen Electron page, without a visible desktop game/player window or focus stealing.
4. The private capture/input bridge sends fresh video and application audio through its own bundled streaming engine. Touch/controller events return to that owned page.
5. Exiting the app/session closes owned processes, pipes and its silent audio sink. Merely installing files does not start a background player.

The module keeps private browser/account state under its own `data/profile/`. It does not sign you in, accept consent screens or clear online account history automatically.

## Requirements

- Linux x64 or ARM64, IZ2S Platform 0.16.0-rc.3 or newer, API 1, console ABI 1 and IZlauncher.
- A working existing Switch 2 / SmileBASIC connection through the platform. This project does not install a bootstrap itself.
- PipeWire/PulseAudio compatibility, `pactl` and `parec` for the owned silent audio path.
- Node.js/npm and Python 3 to prepare a source installation. The pinned desktop runtime uses Electron 44.5.1.
- Network access for YouTube itself. A ready offline installer removes dependency downloads, not the website's internet requirement.

See [supported hosts and validation limits](SUPPORT.md). Windows and macOS console streaming are unsupported. Linux is the implemented streaming target. Desktop build metadata for other platforms is retained as source, but Windows/macOS console-streaming audio backends and physical ARM64 playback are not claimed tested.

## Install

First install IZ2S Platform. VacooTube is independent: BlitBun is not required. Then clone/download this repository or extract a release archive. From this folder:

```sh
IZ2S="/absolute/path/to/iz2s-platform"
./install.sh --platform "$IZ2S"
```

The module ID is **`vacootube`**. All application, server and runtime files are installed under **`modules/VacooTube/`** and packaged as **`vacootube.izm`**. `--replace` migrates the former `youtube` installation and preserves its private data and a backup.

### Source-only installation

After installing the module, explicitly prepare its runtime using **Install on this PC** in the VacooTube library card, or:

```sh
node "$IZ2S/modules/VacooTube/server/local-package/install.cjs"
```

The installer prepares the included fork source and its locked production npm dependencies, with npm lifecycle scripts disabled. It downloads **official Electron**, verifies its published SHA256 inventory and uses that runtime. It does not download another player build or auto-update over your fork.

A source installation needs internet access for missing Electron/npm files. The runtime installer leaves the user profile untouched. If a compatible prepared runtime is already present, it reuses it.

### Ready offline Linux x64 release

Extract the architecture-labelled offline archive, which includes the player runtime and prepared application dependencies. Install it with:

```sh
./install.sh --platform "$IZ2S" --with-runtime
```

Use an archive matching the host architecture. The installer preserves existing module private data. A source Git checkout deliberately excludes the bulky downloaded runtime and `node_modules`; they are supplied as release assets or prepared locally. All application/integration source files are in this repository.

### Intentional update

Stop the affected console session first. Add `--replace` when replacing an installed module, and `--with-runtime` when supplying the matching offline runtime. The previous complete module is kept under the platform's private `data/module-backups/vacootube/`. No console keyboard commands are sent by this file installer.

## Start and controls

Select/load **VacooTube** in IZ2S App library, then open VacooTube on Switch. The separate Controllers module is not required just to navigate this player: its input goes directly to the owned page, not through a virtual PC gamepad.

- **Touch:** native touch start/move/end events for navigation, scrolling and the on-screen keyboard.
- **D-pad / left stick:** navigation.
- **A:** confirm; **B:** back; **X:** play/pause.
- **Menu / Minus:** use the module's visible menu and current shell hints for resume/exit. Game-specific BlitBun double-Minus rules should not be assumed to replace every player control.

First-run/account/consent pages appear on the Switch. Handle them yourself. The host bridge does not require a public debugger/HTTP input port; it uses private inherited pipes scoped to the owned app.

## Video and audio modes

The app renders its interface at **720p by default**. Double-tap **Minus** to open the otherwise hidden console menu, then choose **Render resolution**: 1080p, 720p, 540p, 480p, 360p or 240p. Changes resize the actual offscreen surface and take effect without restarting the app. Touch coordinates follow the selected surface. BC1 requires dimensions in multiples of four; 480p uses 852×480 and 240p uses 428×240. Video content defaults to **480p** when available; the preference is applied once per video, so a subsequent manual quality choice can remain. Source-video quality, interface surface and BlitBun's general game output settings are different values.

The offscreen compositor is configured up to 240 FPS rather than imposing a 30/60 FPS application cap. Actual displayed rate still depends on the content, paint demand, transfer and console. There is no guarantee of 240 FPS or a minimum console frame rate. Ordinary performance HUD and the player's touch-arrow overlay are disabled in the managed mode.

The app uses an **owned silent virtual sink**. Its sound is captured for Switch while staying inaudible on PC speakers; the system default audio device is unchanged. Audio capture is independent of video requests. Missing `pactl`/`parec`, a failed sink or the console's output choice can still prevent sound.

Capture prioritizes fresh compositor output, uses bounded request state and pauses/resumes around stream route transitions. Video recovery requires the main IZ2S native session to remain valid. A terminated ordinary-bootstrap main session still needs a fresh console launch.

## Files in this repository

| Path | Meaning |
| --- | --- |
| `app/` | Complete fork application source, lockfile, assets and original MIT license |
| `server/` | Module integration, touch/input, audio and capture bridge |
| `server/streaming/` | Bundled streaming implementation; no other installed module is required |
| `server/local-package/` | Runtime installer, source preparation and offscreen launcher |
| `switch/` | Console contribution, shaders and branded icon |
| `assets/` | Icon master and generation/design notes |
| `module.json` | Console/server requirements, inventory and bundled BlitBun engine |
| `tools/`, `install.sh` | IZ2S-aware check/package/install/release commands |
| `runtime/` | Prepared Electron and source dependencies; excluded from Git/IZM |
| `data/` | Private player preferences and account profile; excluded from distribution |
| `vacootube.izm` | Generated portable module, not the whole Electron installation |
| `dist/` | Generated source/offline release archives and checksums |

## Develop and package

Edit `app/` to develop the player itself; edit `server/` for console integration. Do not edit cached `runtime/source/<hash>/` or a live `.versions/` snapshot as your source of truth. Re-run the runtime installer after application-source edits so the prepared dependency/source snapshot matches the current fork.

```sh
node tools/module.cjs check --platform "$IZ2S"
node tools/module.cjs pack --platform "$IZ2S"
# Commit finished source changes before release:
node tools/module.cjs release --platform "$IZ2S"
node tools/module.cjs release --platform "$IZ2S" --with-runtime
```

The portable IZM contains both integration source halves, including the app source, but excludes runtime binaries, npm dependency directories and personal data. Only its declared console files are uploaded to Switch. Large dependencies belong beside their module, not in the console payload.

Updates are managed as versioned IZ2S module releases. The fork does not check/install the original application's update feed. Until its own public repository/release location is configured, project/help buttons point to the existing IZ2S platform repository rather than an invented download URL.

[Installation and troubleshooting](docs/OPERATIONS.md) · [Application source guide](app/README.md) · [License inventory](THIRD_PARTY.json).

## Independent installation

VacooTube bundles the capture/codec/transport implementation it uses under `server/streaming/`, adapted from the IZ2S BlitBun source. It does not import an installed BlitBun module and declares no dependency on it. The two modules can be installed individually or together. IZ2S serializes ownership of the console video slot when switching between them. This avoids duplicate active writers while keeping each module self-contained. Electron/system audio libraries remain external system dependencies, not module dependencies.

## Streaming cadence profiles

VacooTube 1.4.0 uses the complete **RUN13 ??? render engine**: WASM BC1 encoding, original one-frame-ahead scheduler, block-delta compression, persistent TCP transport and qualified SDK receiver/unpacking programs. The RUN13 engine's own ABI tables, call-frame builder and native SDK client are included locally. Current RUN16 audio, touch input, route/display freshness protection and menu design remain in place. Neither BlitBun nor another module is required. RUN13 is the default. A second complete RUN16 renderer is bundled under `server/streaming/run16/`, including its native/WASM encoder, compression workers, prefetch scheduler and receiver. Neither renderer imports an installed BlitBun module.

The menu is hidden until a double Minus press. It offers Continue, Render resolution, Render engine and Return to launcher. **Render engine → RUN13 / RUN16** switches the complete renderer and transport in the current player. The old encoder is stopped and its receiver joined before a new writer starts. The player and audio remain open; the picture stays black until a fresh frame is acknowledged. A failed receiver shutdown prevents a replacement writer from starting. The selected resolution is shared between both engines. New settings default to 720p and are saved in `modules/VacooTube/data/render-settings.json`. YouTube source-video quality remains a separate 480p default. An updated RUN16/IZ2S shell with the stream-menu extension is required; the installer refuses an older shell instead of silently losing the new controls.

See [render dependency map](docs/render-engine.md) and `server/streaming/run13/ORIGIN.json` and `server/streaming/run16/ORIGIN.json` for original hashes and compatibility adaptations. No frame-rate guarantee is inferred from a source port.

## Project license

Independently authored IZMYSH code is licensed under **GPL-2.0-or-later**.
See [LICENSE](LICENSE), [COPYRIGHT](COPYRIGHT) and [license scope](LICENSE-SCOPE.md).
Existing component licenses and prior MIT grants remain applicable; this is not
a blanket relicensing of third-party material.
