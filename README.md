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

## Levels As Separate Files

Each level now lives in its own file under `levels/`:

- `levels/training-ground.js`
- `levels/stair-climb.js`

Each level file registers itself on `window.LEVEL_FILES`:

```js
window.LEVEL_FILES = window.LEVEL_FILES || {};
window.LEVEL_FILES["your-level-name"] = {
	version: 1,
	backgroundColor: "#1e293b",
	playerSpawn: { x: 400, y: 250 },
	solids: [
		{
			xPosition: 0,
			yPosition: 487.5,
			collisionWidth: 1600,
			collisionHeight: 12.5,
			backupColor: "#334155",
			friction: 0.5,
			mass: 10
		}
	]
};
```

In-game test controls:

- `3`: load `training-ground`
- `4`: load `stair-climb`
- `r`: reload current level