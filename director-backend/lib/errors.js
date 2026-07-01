export class AppError extends Error {
  constructor(code, message, status = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const ErrorCodes = {
  INVALID_AUTH: 'INVALID_AUTH',
  INTEGRATION_REQUIRED: 'INTEGRATION_REQUIRED',
  VIDEODB_ERROR: 'VIDEODB_ERROR',
  LLM_TIMEOUT: 'LLM_TIMEOUT',
  FFMPEG_ERROR: 'FFMPEG_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  JOB_NOT_FOUND: 'JOB_NOT_FOUND',
  INVALID_INPUT: 'INVALID_INPUT',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL: 'INTERNAL',
};
