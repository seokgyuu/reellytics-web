"use client";

import React from "react";

export default function TermOfService() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>

      <h2 className="text-xl font-semibold mt-6 mb-2">Article 1: Purpose</h2>
      <p className="mb-4">
        These Terms of Service (hereinafter referred to as &quot;the Terms&quot;) govern the rights, obligations, and responsibilities of users and ONE N SIX (hereinafter referred to as &quot;the Company&quot;) regarding the use of the Company’s services.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Article 2: Effect and Amendment of Terms</h2>
      <ul className="list-disc list-inside my-4">
        <li>These Terms apply to all users of the Company’s services.</li>
        <li>
          The Company may revise these Terms as necessary, provided that such amendments do not violate relevant laws. Any changes will be announced at least 7 days before implementation (30 days for significant changes).
        </li>
        <li>If a user does not agree to the amended Terms, they may discontinue the use of the service and request account deletion.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Article 3: Account Registration and Management</h2>
      <ul className="list-disc list-inside my-4">
        <li>Users may register using Google SSO (Single Sign-On).</li>
        <li>Users are responsible for managing their accounts securely and may not transfer or share their accounts with third parties.</li>
        <li>The Company may restrict account usage if a user violates these Terms or engages in fraudulent activities.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Article 4: Provision and Modification of Services</h2>
      <ul className="list-disc list-inside my-4">
        <li>The Company provides authentication and additional services to users.</li>
        <li>
          The Company may modify or discontinue parts or all of its services for technical or operational reasons. In principle, advance notice will be given, but in urgent cases, notice may be provided afterward.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Article 5: User Obligations</h2>
      <ul className="list-disc list-inside my-4">
        <li>Users must comply with applicable laws and these Terms. The following actions are prohibited:</li>
        <ul className="list-disc list-inside ml-6">
          <li>Unauthorized use of another person’s account</li>
          <li>Providing false information</li>
          <li>Interfering with the operation of the service</li>
          <li>Violating public order or legal regulations</li>
        </ul>
        <li>
          If a user violates these provisions, the Company may restrict their service usage and is not responsible for any resulting damages.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Article 6: Limitation of Liability and Disclaimer</h2>
      <ul className="list-disc list-inside my-4">
        <li>
          The Company is not responsible for service interruptions caused by force majeure, such as natural disasters, power outages, or system failures.
        </li>
        <li>The Company does not guarantee the reliability or accuracy of information obtained through the service and assumes no responsibility for any related issues.</li>
        <li>The Company is not liable for damages resulting from the user’s negligence, including unauthorized account access.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Article 7: Service Restrictions and Termination</h2>
      <ul className="list-disc list-inside my-4">
        <li>Users may request account deletion at any time, and the Company will process such requests in accordance with relevant laws.</li>
        <li>
          If a user violates these Terms or causes significant operational disruption, the Company may restrict service access or terminate the user’s account.
        </li>
        <li>The Company reserves the right to terminate certain services without prior notice at its sole discretion.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Article 8: Governing Law and Dispute Resolution</h2>
      <ul className="list-disc list-inside my-4">
        <li>
          These Terms shall be governed by the laws of the Republic of Korea and shall be interpreted to the maximum extent favorable to the Company, as permitted by applicable law.
        </li>
        <li>In case of disputes between the user and the Company, both parties shall first attempt to resolve the issue amicably.</li>
        <li>
          If an amicable resolution is not reached, disputes shall be subject to the exclusive jurisdiction of the courts at the Company’s headquarters. However, the Company reserves the right to choose an alternative jurisdiction based on the user’s location.
        </li>
        <li>
          For international users, disputes may be resolved through arbitration under the rules of the International Chamber of Commerce (ICC), with the arbitration venue set in Seoul, Republic of Korea.
        </li>
      </ul>

      <p className="mt-6 text-gray-500">These Terms of Service take effect on January 30, 2025.</p>
    </div>
  );
}
 