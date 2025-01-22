import chokidar from 'chokidar';
import { WebSocketServer, WebSocket } from 'ws';
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';

const PORT = 8080;
const EXTENSION_DIR = './dist';
const SOURCE_DIR = './src';

// Ensure dist directory exists
if (!existsSync(EXTENSION_DIR)) {
    await mkdir(EXTENSION_DIR, { recursive: true });
}

const ws = new WebSocketServer({ port: PORT }).on('error', (error) => {
    console.log(`[Hot Reload] Error: ${error}`);
});

const broadcastReload = () => {
    ws.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send('reload');
            console.log('[Hot Reload] Reloading extension...');
        }
    });
};

const runBuild = async () => {
    console.log("🏗️ Building...");

    try {
        // First clean the dist directory
        const clean = spawn('bun', ['run', 'clean'], { stdio: 'ignore' }); // inherit
        await new Promise<void>((resolve, reject) => {
            clean.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error('Clean failed'));
            });
        });

        // Then run the build
        const build = spawn('bun', ['run', 'build'], { stdio: 'ignore', });
        await new Promise<void>((resolve, reject) => {
            build.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ Build successful');
                    resolve();
                } else {
                    console.error('❌ Build failed');
                    reject(new Error('Build failed'));
                }
            });
        });

        // Finally copy assets if needed
        const copyAssets = spawn('bun', ['run', 'copy-assets'], { stdio: 'ignore' });
        await new Promise<void>((resolve, reject) => {
            copyAssets.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error('Copy assets failed'));
            });
        }).then(() => {
            console.log('✅ Assets copied');
            broadcastReload();
        }).catch((error) => {
            console.error('❌ Assets copy failed', error);
        });


    } catch (error) {
        error && console.error('Build process failed:', error);
    }
};

// Watch both source and manifest
const watcher = chokidar.watch(
    [SOURCE_DIR, './manifest.json', './package.json'],
    {
        ignoreInitial: true,
        // ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
        ignored: [
            /(^|[\/\\])\../, // ignore dotfiles
            '**/node_modules/**', // ignore node_modules
            'dist/**', // ignore dist directory
            '**/*.log', // ignore log files
        ],
    }
);

watcher.on('ready', () => {
    console.log(`👀 Watching for changes in ${SOURCE_DIR} and manifest.json`);
    // Run initial build
    runBuild();
});

watcher.on('change', async (path) => {
    console.log(`📝 File changed: ${path}`);
    await runBuild();
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n👋 Stopping watcher...');
    watcher.close();
    ws.close();
    process.exit(0);
});