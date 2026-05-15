/**
 * AI Sentiment Analyzer - Frontend Logic
 * 사용자 입력 처리, API 호출(Mock), 모달 제어 담당
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. DOM 요소 선택
  const textarea = document.querySelector("#sentimentText");
  const analyzeButton = document.querySelector("#analyzeButton");
  const currentCharCount = document.querySelector("#currentCharCount");
  const errorMessage = document.querySelector("#errorMessage");

  const modalBackdrop = document.querySelector("#resultModalBackdrop");
  const modalConfirmButton = document.querySelector("#modalConfirmButton");

  const resultLabel = document.querySelector("#resultLabel");
  const resultConfidence = document.querySelector("#resultConfidence");
  const resultReason = document.querySelector("#resultReason");

  // 감성별 색상 및 라벨 매핑 (디자인 시스템 참고)
  const sentimentConfig = {
    positive: { label: "긍정", class: "sentiment-positive" },
    negative: { label: "부정", class: "sentiment-negative" },
    neutral: { label: "중립", class: "sentiment-neutral" }
  };

  // 2. 글자 수 카운팅 이벤트
  textarea.addEventListener("input", () => {
    const length = textarea.value.length;
    currentCharCount.textContent = length;

    // 에러 메시지 초기화
    if (length > 0 && length <= 1000) {
      errorMessage.style.display = "none";
    }
  });

  // 3. 분석 버튼 클릭 이벤트
  analyzeButton.addEventListener("click", async () => {
    const text = textarea.value.trim();

    // 입력값 검증 (Validation)
    if (!text) {
      showError("분석할 텍스트를 입력해주세요.");
      return;
    }

    if (text.length > 1000) {
      showError("텍스트는 최대 1,000자까지 입력할 수 있습니다.");
      return;
    }

    // 로딩 상태 시작
    setLoading(true);

    try {
      // 실제 백엔드 API 호출
      const result = await analyzeSentimentAPI(text);
      
      // 결과 모달 표시
      displayResult(result);
    } catch (error) {
      console.error(error);
      showError(error.message || "서버와 연결할 수 없습니다.");
    } finally {
      // 로딩 상태 종료
      setLoading(false);
    }
  });

  // 4. 모달 닫기 이벤트 (확인 버튼, 배경 클릭, ESC 키)
  modalConfirmButton.addEventListener("click", closeModal);
  
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalBackdrop.classList.contains("active")) {
      closeModal();
    }
  });

  // --- 유틸리티 함수들 ---

  /**
   * 에러 메시지 표시
   */
  function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.style.display = "block";
    textarea.focus();
  }

  /**
   * 로딩 상태 UI 전환
   */
  function setLoading(isLoading) {
    if (isLoading) {
      analyzeButton.disabled = true;
      analyzeButton.textContent = "분석 중...";
      errorMessage.style.display = "none";
    } else {
      analyzeButton.disabled = false;
      analyzeButton.textContent = "감성분석";
    }
  }

  /**
   * 분석 결과를 모달에 데이터 바인딩 후 표시
   */
  function displayResult(data) {
    const config = sentimentConfig[data.sentiment] || sentimentConfig.neutral;

    // 결과값 채우기
    resultLabel.textContent = config.label;
    resultLabel.className = config.class; // 색상 클래스 적용
    resultConfidence.textContent = `신뢰도 ${data.confidence}%`;
    resultReason.textContent = data.reason;

    // 모달 열기
    modalBackdrop.classList.add("active");
  }

  /**
   * 모달 닫기
   */
  function closeModal() {
    modalBackdrop.classList.remove("active");
  }

  /**
   * 실제 백엔드 API를 호출하여 감성을 분석합니다.
   */
  async function analyzeSentimentAPI(text) {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "감성 분석 중 문제가 발생했습니다.");
    }

    return result.data;
  }
});
