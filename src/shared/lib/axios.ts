import axios from 'axios';

// Khởi tạo instance cho API Gateway chung
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Khởi tạo instance riêng nếu dùng Microservices chuyên biệt
export const authClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

export const restaurantClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_RESTAURANT_SERVICE_URL || process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// Interceptor tự động gắn Token
const setupInterceptors = (client: any) => {
  client.interceptors.request.use(
    (config: any) => {
      // Trong thực tế sẽ lấy token từ localStorage hoặc cookies
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: any) => Promise.reject(error)
  );
};

setupInterceptors(apiClient);
setupInterceptors(authClient);
setupInterceptors(restaurantClient);
