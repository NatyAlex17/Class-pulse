import { ApiResponse } from '../contracts/api-response.contract';

export function createApiResponse<TData>(data: TData, message: string): ApiResponse<TData> {
  return {
    success: true,
    data,
    message,
  };
}
