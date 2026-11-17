# VacooTube 1.5.7

This release pairs the PC module with a ready-to-install Switch 2 client.

- Smaller overlay controls and a dedicated EXIT action.
- The Switch executable is included in the PC package as an .iza file.
- The PC module and the Switch executable can also be installed separately.

## Install on the PC

Extract the source installer archive. Open a terminal in the extracted folder and run:

```sh
./install.sh --platform "/path/to/iz2s-platform"
```

Replace the path with your IZ2S Platform installation folder. Keep IZ2S Platform running on the PC while using VacooTube on Switch.

For the Linux x64 offline archive, add `--with-runtime` to the command. The source installer can download the required runtime dependencies.

## Install on Switch 2

1. **Through IZ2S:** Connect your Switch 2 to IZ2S Platform on the PC. Open **App library → Add app** and select `vacootube-1.5.7.iza`. Open **Add App** in IZ2S on the Switch to receive and install the file.
2. **Copy to the SD card:** Open the card on your PC. Create `iz2s/modules/vacootube/` at the root if needed. Copy `vacootube-1.5.7.iza` there and rename it to `launcher.iza`. The final path is `SD:/iz2s/modules/vacootube/launcher.iza`. Reinsert the card and open VacooTube from the IZ2S menu.
