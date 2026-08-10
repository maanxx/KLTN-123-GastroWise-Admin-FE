<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# GastroWise System Architecture & Rules

## 1. Kiến trúc (Architecture)
- **Microservices**: Backend chia thành các service nhỏ. Frontend cấu hình kết nối qua `.env.local` với các biến `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_AUTH_SERVICE_URL`.
- **Modular Frontend**: Admin FE tuân thủ cấu trúc thư mục Feature-Sliced Design. Code dùng chung ở `src/shared/`, code module/nghiệp vụ nằm ở `src/modules/` (auth, users, restaurants).

## 2. Thư viện (Dependencies)
- **Minimalist**: CHỈ sử dụng thư viện bên ngoài khi thực sự cần thiết để giảm thiểu rủi ro xung đột (VD: `lucide-react` cho icon, `recharts` cho biểu đồ, `@tanstack/react-query` cho state). Không lạm dụng thư viện rác.

## 3. Quản lý Hình ảnh (Media Storage)
- **Cloudinary**: Toàn bộ hình ảnh upload (Avatar, Ảnh quán ăn, Cover) PHẢI được đẩy lên Cloudinary (không lưu ở local hay DB). 

## 4. Triển khai (Deployment)
- **Docker**: Hệ thống sẽ được Dockerize (đóng gói bằng Docker) cho cả Frontend và Backend để đồng bộ môi trường triển khai (Dev/Prod).

## 5. Quy chuẩn viết Code (Teamwork Standard)
- **Clean Code**: Giữ code sạch sẽ, dễ đọc, CHỈ comment ở những phần logic phức tạp hoặc có business rule đặc thù. Tránh comment rác.
- Tái sử dụng Component tối đa từ `src/shared/components`. Mọi UI phải tuân thủ chuẩn màu sắc GastroWise (Primary: Emerald, Secondary: Amber, Accent: Orange).

---

# Yêu cầu Đề tài KLTN (Thesis Objectives & Scope)

Để đảm bảo mọi chức năng được xây dựng bám sát mục tiêu của khóa luận tốt nghiệp, hệ thống (bao gồm cả Admin và User FE/BE) phải tuân thủ các nghiệp vụ cốt lõi sau:

## 1. Mục tiêu Cốt lõi của Sản phẩm (Core Value)
- **Tối ưu hóa lộ trình di chuyển**: Hệ thống cho phép người dùng nhập *Sở thích món ăn*, *Thời gian* và *Ngân sách*, từ đó thuật toán AI/Routing sẽ xuất ra một lộ trình di chuyển tối ưu nhất về khoảng cách giữa các địa điểm ẩm thực.
- **Cá nhân hóa trải nghiệm**: Giúp người dùng dễ dàng tìm kiếm, tra cứu và có trải nghiệm ẩm thực phù hợp nhất.

## 2. Tính năng Bắt buộc (Must-have Features)
- **Cộng đồng**: Tích hợp Review/Đánh giá từ cộng đồng thực khách.
- **Admin & Chủ đầu tư**: Tích hợp chức năng Thông báo, Thống kê, và Báo cáo trực quan (Dashboard/AI Insights) giúp nhà đầu tư (Merchant/Admin) theo dõi và đánh giá hiệu quả của từng món ăn/nhà hàng.

## 3. Tiêu chuẩn Đầu ra (Expected Outcomes)
- Một sản phẩm phần mềm (Web/Mobile) có tính **khả thi trong thực tế** và đã qua kiểm thử (Testing), chạy thực nghiệm.
- Báo cáo kỹ thuật chi tiết. Mọi thành viên nắm vững và trình bày được công nghệ đã áp dụng.
- Đích đến học thuật: Viết được một bài báo khoa học trẻ (hoặc bài báo cấp IUH).
