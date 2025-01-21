import chokidar from 'chokidar';
import { WebSocketServer } from 'ws';
// import { spawn } from 'child_process';

const PORT = 8080;
const EXTENSION_DIR = './dist'; // extension's output directory

const ws = new WebSocketServer({ port: PORT })

const broadcastReload = () => {
    ws.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send('reload');
        }
    });
};

const watcher = chokidar.watch(EXTENSION_DIR, { ignoreInitial: true });

watcher.on('change', (path) => {
    console.log(`File changed: ${path}`);
    broadcastReload();
});

watcher.on('ready', () => {
    console.log(`Watching for changes in ${EXTENSION_DIR}`);
});
