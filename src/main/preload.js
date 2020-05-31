import { contextBridge } from 'electron';
import * as api from 'main/api';

contextBridge.exposeInMainWorld('__ASTROFOX__', api);
