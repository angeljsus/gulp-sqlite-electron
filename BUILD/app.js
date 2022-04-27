const { app, BrowserWindow, globalShortcut } = require('electron')
const path = require('path')

// Recargar aplicación cada vez que se modifica un archivo, o se agrega a el proyecto
/*
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
  });
*/
// Recargar aplicación cada vez que se modifica un archivo, o se agrega a el proyecto


function createWindow () {
  const mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: 1366,
    height: 768,
    minWidth: 1366,
    minHeight: 768,
    center: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      nativeWindowOpen: true,
      // devTools: true,
    }
  })

  mainWindow.loadFile('index.html')

  // mainWindow.removeMenu()
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // desactivar comandos
  // globalShortcut.register('CommandOrControl+R', () => {})
  // globalShortcut.register('CommandOrControl+Shift+R', () => {})
  // globalShortcut.register('F5', () => {})
  
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

module.exports = app;