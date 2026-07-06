export interface ApiResponse<TData> {
  success: true;
  data: TData;
  message: string;
}
