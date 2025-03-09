const { app, BrowserWindow } = require('electron');
const { exec } = require('child_process');

let mainWindow;

app.whenReady().then(() => {
    // Inicia o Django
    const djangoServer = exec('python manage.py runserver');

    // Exibir logs do servidor (opcional)
    djangoServer.stdout.on('data', (data) => {
        console.log(`Django: ${data}`);
    });

    setTimeout(() => {
        mainWindow = new BrowserWindow({
            width: 1280,
            height: 800,
            webPreferences: { nodeIntegration: true }
        });

        mainWindow.loadURL('http://127.0.0.1:8000');
    }, 3000);
});

app.on('window-all-closed', () => {
    app.quit();
});
