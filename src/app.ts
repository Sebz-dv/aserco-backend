import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'node:path';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import adminRoutes from './modules/admin/admin.routes';
import knowledgeRoutes from './modules/knowledge/knowledge.routes';
import { errorMiddleware } from './middlewares/error.middleware';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, message: 'API funcionando correctamente.' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/knowledge', knowledgeRoutes);

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    errorMiddleware(err, _req, res, _next);
  });

  return app;
}
