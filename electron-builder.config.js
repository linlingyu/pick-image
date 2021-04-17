module.exports = {
    appId: 'com.english-table.app',
    productName: 'Pick Image',
    directories: {
        app: '.',
        output: 'build'
    },
    mac: {
        icon: './assets/pick-image.png',
        target: 'dmg'
    },
    dmg: {
        title: '${productName}_${version}'
    },
    files: [
        '**/*',
        '!src',
        '!assets'
    ],
    electronDownload: {
        mirror: 'http://npm.taobao.org/mirrors/electron/'
    }
};