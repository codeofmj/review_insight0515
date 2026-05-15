import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// .env 파일의 환경변수를 로드합니다.
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('⚠️ Supabase URL 또는 Service Role Key가 설정되지 않았습니다. .env 파일을 확인해 주세요.');
}

// Supabase 클라이언트를 초기화합니다.
// Service Role Key를 사용하므로 RLS를 우회하여 데이터 저장 및 조회가 가능합니다.
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
