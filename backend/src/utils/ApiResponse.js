class ApiResponse {
  constructor(statusCode, data = null, message = "Success", pagination = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (pagination !== null && pagination !== undefined) {
      this.pagination = pagination;
    }
  }
}

export default ApiResponse;