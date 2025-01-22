"use client";

import React from "react";

export default function TermOfService() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">서비스 약관</h1>
      <p>
        저희 서비스를 이용해 주셔서 감사합니다. 본 서비스를 이용함으로써
        다음의 약관에 동의하는 것으로 간주됩니다:
      </p>
      <ul className="list-disc list-inside my-4">
        <li>제공되는 모든 데이터는 정확하고 최신 상태여야 합니다.</li>
        <li>
          본 약관을 위반할 경우 귀하의 계정이 해지될 수 있습니다.
        </li>
      </ul>
      <p>추가 정보가 필요하시면 으로 문의해 주십시오.</p>
    </div>
  );
}
