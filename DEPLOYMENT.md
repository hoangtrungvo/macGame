# Vercel Deployment Guide

## ⚠️ Lưu ý quan trọng về Socket.IO trên Vercel

Vercel là nền tảng serverless, **không hỗ trợ WebSocket/Socket.IO một cách native** vì:
- Serverless functions chỉ xử lý request/response ngắn hạn
- Không có persistent connections cho WebSocket

## 🚀 Các phương án deploy:

### Phương án 1: Deploy riêng Frontend và Backend (Khuyến nghị)

**Frontend (Next.js) → Vercel:**
1. Tạo project mới trên Vercel
2. Import từ GitHub repository
3. Vercel sẽ tự động detect Next.js và build

**Backend (Socket.IO Server) → Railway/Render/Heroku:**
1. Tạo file `server-only.ts` riêng cho Socket.IO server
2. Deploy lên Railway.app (free tier) hoặc Render.com
3. Update socket connection URL trong code

### Phương án 2: Deploy toàn bộ lên VPS (DigitalOcean/Linode)

Deploy full stack lên VPS với PM2:
```bash
npm install -g pm2
pm2 start tsx -- server.ts
pm2 save
```

### Phương án 3: Sử dụng Vercel Edge Functions (Thử nghiệm)

Cần cấu hình đặc biệt và có giới hạn.

## 📝 Hướng dẫn deploy lên Vercel (Frontend only)

Nếu bạn vẫn muốn thử deploy lên Vercel:

1. **Push code lên GitHub:**
```bash
git add .
git commit -m "Setup for Vercel deployment"
git push origin main
```

2. **Import vào Vercel:**
- Truy cập [vercel.com](https://vercel.com)
- Click "New Project"
- Import repository từ GitHub
- Framework Preset: Next.js
- Build Command: `npm run vercel-build`
- Install Command: `npm install`

3. **Environment Variables:**
Không cần setup biến môi trường đặc biệt.

## ⚙️ Alternative: Railway.app (Recommended cho project này)

Railway.app hỗ trợ WebSocket tốt hơn:

1. **Deploy trên Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Init project
railway init

# Deploy
railway up
```

2. **Hoặc deploy qua Dashboard:**
- Truy cập [railway.app](https://railway.app)
- New Project → Deploy from GitHub
- Chọn repository
- Railway tự động detect và deploy

## 🔧 File đã được setup:

✅ `package.json` - Scripts đã được cấu hình
✅ `vercel.json` - Vercel configuration
✅ `server.ts` - Custom server với Socket.IO

## 💡 Khuyến nghị:

**Sử dụng Railway.app hoặc Render.com** vì:
- ✅ Hỗ trợ WebSocket/Socket.IO đầy đủ
- ✅ Free tier có sẵn
- ✅ Deploy đơn giản
- ✅ Không cần tách frontend/backend
- ✅ Auto deploy từ GitHub

## 🌐 URLs sau khi deploy:

- **Vercel (Frontend):** `https://your-project.vercel.app`
- **Railway (Full Stack):** `https://your-project.up.railway.app`

---

Nếu cần hỗ trợ thêm, hãy cho biết bạn muốn deploy lên platform nào! 🚀
