// src/server.js — STORY™ Backend
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB } from './database.js';

import authRouter          from './routes/auth.js';
import forgotPasswordRouter from './routes/forgotPassword.js';
import productsRouter      from './routes/products.js';
import cartRouter          from './routes/cart.js';
import ordersRouter        from './routes/orders.js';
import paymentRouter       from './routes/payment.js';
import couponsRouter       from './routes/coupons.js';
import inventoryRouter     from './routes/inventory.js';
import adminRouter         from './routes/admin.js';
import wishlistRouter      from './routes/wishlist.js';
import newsletterRouter    from './routes/newsletter.js';
import addressesRouter     from './routes/addresses.js';
import returnsRouter       from './routes/returns.js';
import uploadsRouter       from './routes/uploads.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: '*', methods: ['GET','POST','PATCH','PUT','DELETE','OPTIONS'] }));
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth',        authRouter);
app.use('/api/auth',        forgotPasswordRouter);
app.use('/api/products',    productsRouter);
app.use('/api/cart',        cartRouter);
app.use('/api/orders',      ordersRouter);
app.use('/api/payment',     paymentRouter);
app.use('/api/coupons',     couponsRouter);
app.use('/api/inventory',   inventoryRouter);
app.use('/api/admin',       adminRouter);
app.use('/api/wishlist',    wishlistRouter);
app.use('/api/newsletter',  newsletterRouter);
app.use('/api/addresses',   addressesRouter);
app.use('/api/returns',     returnsRouter);
app.use('/api/upload',      uploadsRouter);

app.use((req, res) => res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` }));
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

initDB();
app.listen(PORT, () => {
  console.log(`🚀 STORY™ Backend running on http://localhost:${PORT}`);
  console.log(`   Admin: admin@story.com / admin123`);
});
