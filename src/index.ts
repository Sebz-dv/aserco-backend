import { createApp } from './app';
import { ensureDatabase } from './config/database';
import { env } from './config/env';
import { initializeSchema } from './database/schema';

async function startServer() {
  try {
    await ensureDatabase();
    await initializeSchema();

    const app = createApp();

    app.listen(env.PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
