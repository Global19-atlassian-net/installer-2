const { app } = require('electron')

const { windowManager } = require('./window-manager')
const { setupApplicationMenu } = require('./window-menu')
const { DeveloperFeatures } = require('./developer')
const { isDevMode } = require('../utils/is-dev-mode')

class App {
  constructor () {
    // Keep a reference of the window object, if you don't, the window will
    // be closed automatically when the JavaScript object is garbage collected.
    this.mainWindow = null
    this.developerFeatures = null

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', this.onReady)

    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
      // On OS X it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    app.on('activate', () => {
      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (this.mainWindow === null) {
        this.onReady()
      }
    })
  }

  onReady () {
    if (isDevMode) {
      this.developerFeatures = new DeveloperFeatures()
    }

    const mainWindow = windowManager.createMainWindow()

    // Load the index.html of the app. Once loaded, we'll display
    // the window.
    mainWindow.loadURL(`file://${__dirname}/../renderer/index.html`)
    mainWindow.webContents.on('did-finish-load', () => mainWindow.show())

    // Chromium drag and drop events tend to navigate the app away, making the
    // app impossible to use without restarting. These events should be prevented.
    mainWindow.webContents.on('will-navigate', (event) => event.preventDefault())

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
      this.mainWindow = null
    })

    // This creates the application's main menu (on macOS found in the menu bar, for instance)
    setupApplicationMenu()

    this.mainWindow = mainWindow
  }
}

// eslint-disable-next-line
const installer = new App()
