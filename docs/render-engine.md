# Render engine dependency map — VacooTube 1.4.0

The default render/transport implementation comes from the RUN13 `???` snapshot.
The overlay also offers a complete, independently bundled RUN16 engine.
Each original source SHA256 is recorded in `server/streaming/run13/ORIGIN.json`.
Only imports and the profile default are adapted in these originals.

| Stage | Module-owned files | Purpose |
| --- | --- | --- |
| Capture | `server/local-package/bootstrap.cjs`, `frame-capture.cjs`, `index.cjs` | Current hidden Electron window, fresh paint requests, resize acknowledgement and bounded frame parsing |
| Resolution | `server/local-package/render-sizes.cjs`, `server/render-settings.cjs` | Validate six resolutions, default to 720p, persist preference outside code |
| Scheduling | `server/streaming/lib/hl2-stream.cjs`, `frame-pacing.js` | Original RUN13 one-upload/one-candidate overlap, slow-ACK discards and recovery |
| Encoding | `hl2-frame-worker.cjs`, `pc-codec.js`, `frame-codec.wasm` in that lib folder | Original RUN13 BC1 WASM encoder |
| Compression | `block-delta.cjs`, `block-delta-worker.cjs` | Original RUN13 slot dictionaries, changed-block packets and compression policy |
| Transport | `pc-stream-delta.cjs`, `pc-stream-tcp.cjs`, `ack-wait.cjs` | Original persistent transport, bounded ACK waits and receiver recovery |
| Console unpacking | `delta-programs.cjs`, `zlib-sdk.cjs`, `run13/abi/` | Original qualified SDK calls, call-frame builder, function tables and native client |
| Integration | `server/streaming/stream.cjs`, `server/session-hook.cjs` | Bind the original engine to the current route guard, display heartbeat and selected profile |
| Display/menu | Existing shared BC1 shader fragments plus `switch/modules/vacootube-menu.glsl` | Current RUN16 display ABI; isolated menu contribution without replacing another module's shaders |
| Touch | `server/youtube-input.cjs`, local `controller-source.cjs` | Normalize Switch input to the selected Electron surface without importing Controllers |

Audio is the existing RUN16 owned silent-sink path. The application fork, account
profile, source-video-quality preference and current menu design are retained.
No RUN13 browser picker, desktop application, user data, menu or game module is copied.
No runtime path points into an old release folder or another installed module.

The platform still supplies its public session RPC, PCM/input services and shell
composition. The original receiver reads the same ABI-compatible BC1 publication
buffers. The wrapper forwards current display heartbeats and waits for the current
route guard; it does not substitute the newer compression or receiver algorithms.

New settings use 720p. The console menu appears only on a double Minus press,
including while waiting for a fresh stream. It offers 1080p, 720p, 540p, 480p, 360p
and 240p. Widths are rounded to a BC1 block boundary. Resize starts a new source
epoch, discards old-size responses, waits for Electron's resize acknowledgement,
and then captures a fresh frame. A stopped module never continues writing frames.

## RUN16 alternative and live switching

`server/streaming/run16/lib/` owns the RUN16 dependency closure: scheduler,
frame/DEFLATE workers, WASM BC1 encoder, native codec loaders, compression
prefetch/wire pipeline, delta programs and persistent receiver. Optional native
source lives in `server/streaming/run16/native/`; missing native compilation
falls back to the included WASM/JavaScript path. Public IZ2S ABI, native-build
and post-menu APIs are used; no other module is loaded. Original hashes are in
`server/streaming/run16/ORIGIN.json`.

Double Minus → Render engine → RUN13 or RUN16. Settings persist as `engine`
and `height` in the same private JSON file. A resolution change preserves the
engine; an engine change preserves the resolution. Engine changes run through
the application's serialized option queue: hide video, pause capture, stop the
encoder, drain receiver preparation, close/join the old transport, save the
selection, then create the new transport and encoder. The Electron player,
touch sampler and audio sink stay alive. Video is released only after fresh
publication/acknowledgement. Incomplete receiver shutdown fails closed instead
of starting two writers.
