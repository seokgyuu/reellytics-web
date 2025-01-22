"use client";

import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">개인정보 처리방침</h1>
      <p>
        저희는 고객님의 개인정보를 소중히 여깁니다. 이 정책은 저희가 수집하는 개인정보의 유형과 이를 사용하는 방법에 대해 설명합니다:
      </p>
      <ul className="list-disc list-inside my-4">
        <li>저희는 이름과 이메일과 같은 기본적인 개인정보를 수집합니다.</li>
        <li>고객님의 데이터는 안전하게 저장되며 제3자와 공유되지 않습니다.</li>
        <li>
          언제든지 고객님의 개인정보를 열람하거나 삭제를 요청할 수 있습니다.
        </li>
      </ul>
      <p>궁금한 점이나 문제가 있으시면 으로 문의해 주십시오.</p>
    </div>
  );
}
