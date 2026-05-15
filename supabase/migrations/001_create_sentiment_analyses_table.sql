-- 001_create_sentiment_analyses_table.sql
-- 사용자의 감성 분석 요청과 결과를 저장하는 테이블입니다.

-- 테이블 생성
CREATE TABLE IF NOT EXISTS sentiment_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  input_text TEXT NOT NULL,
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  sentiment_label TEXT NOT NULL CHECK (sentiment_label IN ('긍정', '부정', '중립')),
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 검색 성능 향상을 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS sentiment_analyses_created_at_idx ON sentiment_analyses (created_at DESC);
CREATE INDEX IF NOT EXISTS sentiment_analyses_sentiment_idx ON sentiment_analyses (sentiment);
