import {} from 'axios'
declare module 'axios' {
  export interface AxiosInstance {
    (config: AxiosRequestConfig): AxiosPromise;
    (url: string, config?: AxiosRequestConfig): AxiosPromise;
    defaults: AxiosRequestConfig;
    interceptors: {
      request: AxiosInterceptorManager<AxiosRequestConfig>;
      response: AxiosInterceptorManager<AxiosResponse>;
    };
    getUri(config?: AxiosRequestConfig): string;
    request<T = any, R = Base.IResponseData<T>> (config: AxiosRequestConfig): Promise<R>;
    get<T = any, R = Base.IResponseData<T>>(url: string, config?: AxiosRequestConfig): Promise<R>;
    delete<T = any, R = Base.IResponseData<T>>(url: string, config?: AxiosRequestConfig): Promise<R>;
    head<T = any, R = Base.IResponseData<T>>(url: string, config?: AxiosRequestConfig): Promise<R>;
    options<T = any, R = Base.IResponseData<T>>(url: string, config?: AxiosRequestConfig): Promise<R>;
    post<T = any, R = Base.IResponseData<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R>;
    put<T = any, R = Base.IResponseData<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R>;
    patch<T = any, R = Base.IResponseData<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R>;
  }
}
