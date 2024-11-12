import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

export class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.api = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        logger.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          logger.error('API Response Error:', {
            status: error.response.status,
            data: error.response.data
          });

          // Handle token expiration
          if (error.response.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
          }
        } else if (error.request) {
          logger.error('API Request Failed:', error.request);
        } else {
          logger.error('API Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: any): Promise<T> {
    try {
      const response = await this.api.get<T>(url, { params });
      return response.data;
    } catch (error) {
      logger.error('GET Request Failed:', { url, error });
      throw error;
    }
  }

  async post<T>(url: string, data: any): Promise<T> {
    try {
      const response = await this.api.post<T>(url, data);
      return response.data;
    } catch (error) {
      logger.error('POST Request Failed:', { url, data, error });
      throw error;
    }
  }

  async put<T>(url: string, data: any): Promise<T> {
    try {
      const response = await this.api.put<T>(url, data);
      return response.data;
    } catch (error) {
      logger.error('PUT Request Failed:', { url, data, error });
      throw error;
    }
  }

  async delete<T>(url: string): Promise<T> {
    try {
      const response = await this.api.delete<T>(url);
      return response.data;
    } catch (error) {
      logger.error('DELETE Request Failed:', { url, error });
      throw error;
    }
  }
} 