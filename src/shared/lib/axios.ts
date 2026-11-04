import axios from 'axios';

// Khởi tạo instance cho API Gateway chung
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Khởi tạo instance riêng nếu dùng Microservices chuyên biệt
export const authClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000,
});

export const restaurantClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_RESTAURANT_SERVICE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000,
});

// Interceptor tự động gắn Token từ mọi nguồn phổ biến (token, admin_token, accessToken)
const setupInterceptors = (client: any) => {
  client.interceptors.request.use(
    (config: any) => {
      if (typeof window !== 'undefined') {
        const token =
          localStorage.getItem('admin_token') ||
          localStorage.getItem('token') ||
          localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error: any) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      if (error?.response?.status === 401) {
        console.warn(`[API 401 Unauthorized]: ${error.config?.url}`);
      }
      return Promise.reject(error);
    }
  );
};

setupInterceptors(apiClient);
setupInterceptors(authClient);
setupInterceptors(restaurantClient);
