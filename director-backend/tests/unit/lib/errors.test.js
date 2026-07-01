import { describe, it, expect } from 'vitest';
import { AppError, ErrorCodes } from '../../../lib/errors.js';

describe('AppError', () => {
  it('has code, status, message, details', () => {
    const e = new AppError('T', 'm', 400, { x: 1 });
    expect(e.code).toBe('T');
    expect(e.status).toBe(400);
    expect(e.message).toBe('m');
    expect(e.details).toEqual({ x: 1 });
  });
  it('exposes all error codes', () => {
    expect(ErrorCodes.INVALID_AUTH).toBe('INVALID_AUTH');
    expect(ErrorCodes.VIDEODB_ERROR).toBe('VIDEODB_ERROR');
    expect(ErrorCodes.JOB_NOT_FOUND).toBe('JOB_NOT_FOUND');
  });
});
