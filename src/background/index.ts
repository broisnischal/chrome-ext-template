import { ENV } from '../env.js'
import './extension.js'
import './storage.js'

// Hot reload
ENV === 'development' && import('./hot-reload-client.js')