# VacooTube 1.4.0

Local GitHub preparation candidate; not published. Requires IZ2S Platform
0.16.0-rc.3 or newer with the console stream-menu extension.

- Bundle the full RUN13 render engine and a complete RUN16 alternative.
- Double Minus opens the hidden console overlay: Continue, Render resolution,
  Render engine, Return to launcher.
- Default: RUN13, 720p. Render sizes: 1080p, 720p, 540p, 480p, 360p, 240p.
- Live engine switching joins the old renderer before starting another,
  preserves render resolution and keeps the player/audio alive.
- Native touch follows the actual render surface; audio remains module-owned.
- Install independently from BlitBun; no installed streaming-module dependency.

Source-video quality remains a separate 480p preference. The source archive
installs the app/runtime on demand; the Linux x64 offline archive includes the
prepared source dependencies and official Electron runtime, without user data.

See VALIDATION.md and docs/render-engine.md for local check coverage and hardware
limits. Original upstream attribution and license notices remain intact.

- License independently authored IZMYSH code under GPL-2.0-or-later; retain explicit component terms and prior grants.
