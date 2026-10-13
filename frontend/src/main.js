import { createRouter } from './router.js';
import * as authService from './services/authService.js';

async function bootstrap() {
  await authService.restoreSession();
  createRouter(document.getElementById('app')).start();
}

bootstrap();
