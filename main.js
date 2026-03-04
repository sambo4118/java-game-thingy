const { app, BrowserWindow } = require("electron");
const path = require("path");

app.disableHardwareAcceleration();

function createWindow() {
  const window = new BrowserWindow({
    width: 1080,
    height: 720,
    title: "java-game-thingy",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  window.loadFile(path.join(__dirname, "index.html"));
  
  // Open DevTools for debugging
  window.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
