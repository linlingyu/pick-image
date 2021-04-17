import { ipcMain, IpcMainEvent, dialog, OpenDialogReturnValue } from "electron";
import path from "path";
import os from "os";
import { values } from "webpack.rules";
// 
export const event = {
    initialize() {
        ipcMain.on('BROWSE_SOURCE', (event: IpcMainEvent) => {
            dialog.showOpenDialog({
                title: '请选择一个图片目录',
                defaultPath: path.join(os.homedir(), 'Pictures'),
                properties: ['openDirectory', 'multiSelections']
            }).then((value: OpenDialogReturnValue) => {
                event.returnValue = value.filePaths;
            });
        });
        // 
        ipcMain.on('CHANGE_TARGET', (event: IpcMainEvent, {filePath}) => {
            const defaultPath: string = filePath || path.join(os.homedir(), 'Desktop', 'pic');
            dialog.showOpenDialog({
                title: '请选择一个目标目录',
                defaultPath: path.dirname(defaultPath),
                properties: ['openDirectory']
            }).then((value: OpenDialogReturnValue) => {
                event.returnValue = value.filePaths[0];
            });
        });
        // 
    }
};