import { vi } from 'vitest';

process.env.VIDEO_DB_API_KEY = 'test_videodb_key';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test_anon';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service';
process.env.OPENAI_API_KEY = 'test_openai';
process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.DIRECTOR_SERVICE_KEY = 'test_service_key';
process.env.PORT = '0';
process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
