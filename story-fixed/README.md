# STORY™ — Full Stack E-Commerce

## Features
- ✅ Product catalog with brands, categories, variants (size/color)
- ✅ Cart, wishlist, real-time stock management
- ✅ JWT authentication (login, register)
- ✅ **Forgot/Reset password** with email link
- ✅ **Order confirmation emails** via Nodemailer
- ✅ **Address book** (save/manage/set default)
- ✅ **Return/refund requests** (user + admin management)
- ✅ **Product image upload** (admin panel)
- ✅ Razorpay payment integration
- ✅ GST 18% + coupon engine + COD
- ✅ Admin dashboard (orders, products, inventory, coupons, users, returns)

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your keys
node src/server.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Admin Login
- Email: `admin@story.com`
- Password: `admin123`

### Sample Coupons
- `WELCOME10` — 10% off (max ₹500)
- `FLAT500` — ₹500 off (min ₹2000)
- `STORY20` — 20% off (min ₹5000, max ₹2000)

## Environment Variables

### Email (Optional but recommended)
1. Enable 2FA on Gmail
2. Go to myaccount.google.com/apppasswords
3. Create an App Password
4. Set SMTP_USER=your@gmail.com and SMTP_PASS=the_app_password

### Razorpay
Get test keys from razorpay.com/dashboard

## New Features in This Version

### Forgot/Reset Password
- User clicks "Forgot password?" on login screen
- Enters email → receives reset link (or dev token logged to console)
- Clicks link → lands on reset form → enters new password

### Email Confirmation
- After each successful order, customer receives a professional HTML email
- Configure SMTP in .env to enable

### Address Book
- Users save multiple addresses (Home/Work/Other)
- Set default address
- Select saved address during checkout

### Return/Refund Requests
- Users request returns from Profile → Returns tab
- Only delivered orders can be returned
- Admin manages requests from Admin Panel → Returns tab
- Status flow: requested → approved → processing → completed/rejected

### Product Image Upload
- Admin adds/edits products with image URLs
- Upload endpoint: POST /api/upload/product-image
- Images served from /uploads/ directory

## Production Checklist
- [ ] Change JWT_SECRET to a strong random string
- [ ] Set NODE_ENV=production
- [ ] Configure real Razorpay live keys
- [ ] Configure real SMTP credentials
- [ ] Set FRONTEND_URL to your domain
- [ ] Use a process manager (PM2) for backend
- [ ] Build frontend: `npm run build`
