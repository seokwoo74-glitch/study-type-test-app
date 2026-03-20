"use client";

import { useState } from "react";

export default function Page() {
  const [started, setStarted] = useState(false);

  return (
    <div style={{ padding: 40 }}>
      {!started ? (
        <>
          <h1>학습성향 검사</h1>
          <button onClick={() => setStarted(true)}>검사 시작</button>
        </>
      ) : (
        <div>
          <h2>테스트 화면 정상 작동 🎉</h2>
          <p>이제 여기에 너 만든 코드 붙이면 된다</p>
        </div>
      )}
    </div>
  );
}