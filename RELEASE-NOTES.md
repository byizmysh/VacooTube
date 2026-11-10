# VacooTube 1.5.3 — IZ2S Platform 0.22

- Requires [IZ2S Platform 0.22](https://github.com/byizmysh/IZ2S-Platform/releases/tag/v0.22.0) and a connected console session.
- Self-contained ABI-1 GPU application with module-owned shaders, font and menu; RAM and SD installation use the same host runtime.
- Adaptive bounded audio buffering accounts for actual refill latency and reports missed deadlines.
- Video acknowledgements carry input and route telemetry, removing redundant steady-stream polling and timer-driven display resets.
- Double R3 returns to the launcher; double Minus opens the module menu. Performance overlay is off by default.
- Source installation package and portable IZM are included.
- Linux x64 offline package also includes the player runtime and prepared production dependencies; no separate BlitBun module is needed.

# VacooTube 1.4.1

- Give the render engines clear names: Classic and Advanced.
- Update the console overlay, status labels and rendering guide consistently.
- Preserve existing engine selections, default resolution and streaming behavior.

# VacooTube 1.4.0

First public VacooTube module release for NS2 and IZ2S Platform.

- Independent installation under `modules/VacooTube/`; the required BlitBun streaming implementation is bundled.
- Complete fork application source, controller/touch integration and a silent PC audio path.
- Classic and Advanced render engines, selectable from the hidden double-Minus console menu.
- Live render resolutions from 1080p to 240p, defaulting to 720p; source-video quality separately defaults to 480p.
- Linux x64 offline archive with Electron and prepared production dependencies; a smaller source archive is also available.
- Real local application screenshots and direct links to this repository and its releases.

Requires IZ2S Platform 0.16.0-rc.3 or newer and a working console session. Linux ARM64 is a declared source-install target with incomplete physical validation. Windows and macOS console streaming are unsupported. Local application startup, input/capture, packaging and installation checks do not establish physical-console performance guarantees.

The application is a fork of VacuumTube. Original MIT notices and component licenses are retained; independently authored IZMYSH integration uses GPL-2.0-or-later. See COPYRIGHT, LICENSE-SCOPE.md and THIRD_PARTY.json.
