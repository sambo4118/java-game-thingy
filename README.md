# java-game-thingy

Native desktop-window prototype using Electron.

## Run locally (opens real window)

- `npm install`
- `npm run start:local`

## How this works in GitHub Codespaces

Codespaces runs in a remote Linux container and usually does not provide a normal desktop display session.

- Electron app code still runs in Codespaces.
- A native OS window usually cannot appear unless you add a remote desktop/X11 setup.

If your goal is a true native window (like tkinter), the simplest path is running this same repo locally on your machine.

## Enable GUI in Codespaces (desktop-lite)

This repo includes [.devcontainer/devcontainer.json](.devcontainer/devcontainer.json) with the `desktop-lite` feature.

1. Rebuild your container:
	- Command Palette -> `Codespaces: Rebuild Container`
2. After rebuild, open forwarded port `6080` in browser (labeled `Desktop (noVNC)`).
3. Inside that web desktop terminal, run:
	- `npm start`

Electron will open as a native Linux window inside the remote desktop session.

Note: `npm start` uses `--no-sandbox` for container compatibility. On your own machine, prefer `npm run start:local`.
It also disables GPU acceleration in Codespaces to avoid EGL-related startup failures.