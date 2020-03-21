const electron = require("electron");
const fs = require("fs");
const { app, BrowserWindow, ipcMain, dialog, Menu } = electron;
let win;
let filePath = undefined;

app.on("ready", () => {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  });
  win.loadFile("index.html");
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
});

ipcMain.on("save", (renderer, text) => {
  if (filePath === undefined) {
    dialog.showSaveDialog(win, { defaultPath: "filename.txt" }, fullpath => {
      if (fullpath) {
        filePath = fullpath;
        writeTofile(text);
      }
    });
  } else {
    writeTofile(text);
  }
});

const writeTofile = data => {
  fs.writeFile(filePath, data, err => {
    if (err) console.log("Deu erro", err);
    console.log("file has been saved");
    win.webContents.send("saved", "success");
  });
};

const menuTemplate = [
  process.platform == "darwin"
    ? {
        label: app.getName(),
        submenu: [{ role: "about" }]
      }
    : {
        label: app.getName(),
        submenu: [
          {
            label: "Learn More",
            click: async () => {
              const { shell } = require("electron");
              await shell.openExternal("https://electronjs.org");
            }
          }
        ]
      },
  {
    label: "File",
    submenu: [
      {
        label: "Save",
        accelerator: 'CmdOrCtrl+S',
        click() {
          win.webContents.send('menu-save')
        }
      },
      {
        label: "Save as",
        accelerator: 'CmdOrCtrl+Shift+S',
        click() {
          filePath = undefined
          win.webContents.send('menu-save')
        }
      }
    ]
  },
  { role: "editMenu" },
  { role: "viewMenu"}
];
