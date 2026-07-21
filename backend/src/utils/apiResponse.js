class ApiResponse {
  constructor(statusCode, success, message, data = null, meta = null) {
    this.statusCode = statusCode;
    this.success = success;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }
}

module.exports = ApiResponse;
