import { app, Menu } from "electron";
// 
const menuInstance = Menu.buildFromTemplate([{
    label: app.name,
    submenu: [
        {
            role: 'about',
            label: 'About Pick Image'
        },
        {type: 'separator'},
        {role: 'close'}
    ]
}]);
// 
export const menu = {
    initialize() {
        Menu.setApplicationMenu(menuInstance);
    }
}