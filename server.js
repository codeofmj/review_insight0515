import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { supabase } from './lib/supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // public 폴더의 정적 파일 서비스 (index.html 등)

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 감성 라벨 매핑 (영어 -> 한국어)
const sentimentLabelMap = {
  positive: "긍정",
  negative: "부정",
  neutral: "중립"
};

/**
 * [POST] /api/analyze
 * 사용자의 텍스트를 분석하고 결과를 반환합니다.
 */
app.post('/api/analyze', async (req, res) => {
  const { text } = req.body;

  // 1. 입력값 검증 (Validation)
  if (!text || text.trim() === "") {
    return res.status(400).json({ success: false, message: "분석할 텍스트를 입력해주세요." });
  }

  if (text.length > 1000) {
    return res.status(400).json({ success: false, message: "텍스트는 최대 1,000자까지 입력할 수 있습니다." });
  }

  try {
    // 2. OpenAI API 호출
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 또는 사용 가능한 모델 (예: gpt-3.5-turbo)
      messages: [
        {
          role: "system",
          content: "당신은 한국어 텍스트의 감성을 분석하는 AI입니다. 입력 문장을 positive, negative, neutral 중 하나로 분류하세요. 반드시 JSON 형식으로만 응답하세요. confidence는 0부터 100 사이의 정수입니다. reason은 한국어 2~3문장으로 작성하세요."
        },
        {
          role: "user",
          content: `다음 텍스트의 감성을 분석하세요.\n\n텍스트:\n${text}\n\n응답 형식:\n{\n  "sentiment": "positive | negative | neutral",\n  "confidence": 0-100,\n  "reason": "분석 이유 2~3문장"\n}`
        }
      ],
      response_format: { type: "json_object" }
    });

    // 3. AI 응답 파싱
    const aiResult = JSON.parse(response.choices[0].message.content);
    const { sentiment, confidence, reason } = aiResult;
    const sentimentLabel = sentimentLabelMap[sentiment] || "중립";

    // 4. Supabase에 결과 저장 (비동기로 진행하되 오류는 기록만 함)
    saveToSupabase(text, sentiment, sentimentLabel, confidence, reason);

    // 5. 클라이언트에 응답 반환
    return res.json({
      success: true,
      data: {
        sentiment,
        sentimentLabel,
        confidence,
        reason
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: "감성 분석 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." 
    });
  }
});

/**
 * Supabase에 분석 결과를 저장하는 헬퍼 함수
 */
async function saveToSupabase(input_text, sentiment, sentiment_label, confidence, reason) {
  try {
    const { error } = await supabase
      .from('sentiment_analyses')
      .insert([
        { input_text, sentiment, sentiment_label, confidence, reason }
      ]);

    if (error) {
      console.error('Supabase 저장 실패:', error.message);
    } else {
      console.log('✅ 데이터가 Supabase에 성공적으로 저장되었습니다.');
    }
  } catch (err) {
    console.error('Supabase 연동 중 예외 발생:', err);
  }
}

// 서버 시작 (로컬 환경에서만 실행)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 서버가 실행되었습니다: http://localhost:${PORT}`);
  });
}

// Vercel 서버리스 함수를 위해 app 객체를 내보냅니다.
export default app;
