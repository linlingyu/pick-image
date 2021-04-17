import { app, Display, screen, BrowserWindow } from "electron";
import path from "path";
import { menu } from "./menu";
import { event } from './event';
// 
app.whenReady().then(() => {
    const display: Display = screen.getPrimaryDisplay(),
        // workArea: Rectangle = display.workArea,
        win: BrowserWindow = new BrowserWindow({
            width: 640,
            height: 500,
            center: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
                // devTools: true // set true when debug
            }
        });
    // 
    event.initialize();
    menu.initialize();
    // win.loadFile(path.join(app.getAppPath(), 'out', 'electron-browser', 'index.html'));
    win.loadFile(path.join(__dirname, 'electron-browser', 'index.html'));
    win.webContents.openDevTools();
});