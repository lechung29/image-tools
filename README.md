# 🖼️ Image Upscaler

Upscale ảnh 2× bằng AI, dùng Next.js fullstack + Replicate API.

## Tính năng

- Upload cả thư mục ảnh một lúc
- Upscale 2×
- Xem tiến trình real-time từng ảnh (SSE streaming)
- Tải về file ZIP chứa ảnh đã upscale, giữ nguyên tên file

## Cài đặt

### 1. Cài dependencies

```bash
npm install
```

### 2. Lấy Replicate API Token

- Đăng ký tài khoản tại [replicate.com](https://replicate.com)
- Vào [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
- Tạo token mới
- Replicate tặng credit miễn phí ban đầu (~$5)

### 3. Tạo file `.env.local`

```bash
cp .env.local.example .env.local
```

Điền API token vào:

```env
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxx
```

### 4. Chạy dev server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

## Cách dùng

1. Click "CHỌN THƯ MỤC ẢNH" → chọn thư mục chứa ảnh
2. Click "UPSCALE 2×"
3. Chờ từng ảnh được xử lý (có thể mất 10-30s/ảnh tuỳ độ phân giải)
4. Khi xong, click "TẢI ZIP" để download thư mục ảnh đã upscale

## Lưu ý

- Output là PNG
- Tên file gốc được giữ nguyên
- Ảnh quá lớn (>4000px) có thể cần scale nhỏ lại trước
- Trên Vercel Free: timeout 60s → chỉ dùng được với ~2-3 ảnh nhỏ
- Trên Vercel Pro: timeout 300s → xử lý được nhiều ảnh hơn

## Tuỳ chỉnh model

Trong `app/api/upscale/route.ts`, có thể chỉnh:

```typescript
input: {
  image: dataUrl,
  scale: 4,           // upscale 4× (chậm hơn)
  face_enhance: true, // bật nếu ảnh chân dung
}
```

## Deploy lên Vercel

```bash
npx vercel
```

Nhớ thêm `REPLICATE_API_TOKEN` vào Environment Variables trong Vercel dashboard.
