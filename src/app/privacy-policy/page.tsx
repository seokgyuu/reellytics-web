"use client";

import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
        
      <p className="mb-4">
        ONE N SIX (hereinafter referred to as &apos;the Company&apos;) is committed to protecting your personal information.
        This policy explains what types of personal information we collect and how we use it.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Article 1: Purpose of Personal Information Collection and Use</h2>
      <p className="mb-4">
        The Company collects and uses personal information within the following scope to provide seamless services to users:
      </p>
      <ul className="list-disc list-inside my-4">
        <li>User authentication and service provision</li>
        <li>Responding to customer inquiries</li>
        <li>Compliance with laws and terms of service</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Article 2: Collected Personal Information and Collection Methods</h2>
      <h3 className="font-semibold mt-2">Collected Personal Information</h3>
      <ul className="list-disc list-inside my-2">
        <li>(Required) Information provided through SSO login: Email (using Google login)</li>
      </ul>
      <h3 className="font-semibold mt-2">Methods of Collecting Personal Information</h3>
      <ul className="list-disc list-inside my-2">
        <li>Automatically collected through Google SSO (Single Sign-On) login integration</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Article 3: Retention and Use Period of Personal Information</h2>
      <p className="mb-4">
        The Company, in principle, promptly deletes personal information once the purpose of collection and use is achieved. However, if retention is required under relevant laws, the information will be stored for the legally mandated period and then deleted.
      </p>
      <ul className="list-disc list-inside my-2">
        <li>Login records: 3 months (Communications Privacy Protection Act)</li>
        <li>Under GDPR: Immediate deletion upon user request</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Article 4: Provision and Entrustment of Personal Information to Third Parties</h2>
      <p className="mb-4">
        The Company does not provide users’ personal information to external parties. Some service operations may be outsourced, and in such cases, the Company ensures that personal information is securely managed in compliance with privacy laws, including GDPR and CCPA.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Article 5: Overseas Data Transfer</h2>
      <p className="mb-4">
        The Company stores users’ personal information on servers located in South Korea and applies appropriate protection measures in accordance with the legal requirements of specific countries. For users within the European Union (EU), adequate safeguards (such as SCCs, BCRs) are provided in compliance with GDPR.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Article 6: User Rights and How to Exercise Them</h2>
      <p className="mb-4">
        Users can access, correct, delete, or request the suspension of their personal information processing at any time.
      </p>
      <ul className="list-disc list-inside my-2">
        <li>Under GDPR, users have the right to data portability (request for data transfer to another service) and the right to be forgotten (request for deletion).</li>
        <li>Under CCPA, users can request disclosure of personal information and opt out of the sale of their data.</li>
        <li>Users can contact customer support for inquiries regarding personal information, and the Company will promptly take action.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Article 7: Protection and Management of Personal Information</h2>
      <p className="mb-4">
        The Company takes the following measures to securely protect personal information:
      </p>
      <ul className="list-disc list-inside my-2">
        <li>Encryption and restricted access to personal information</li>
        <li>Operation of security systems to prevent hacking and viruses</li>
        <li>Minimization of personnel handling personal information and conducting regular training</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Article 8: Personal Information Protection Officer and Contact Information</h2>
      <p className="mb-4">
        The Company has designated the following personal information protection officer to safeguard users&apos; personal information:
      </p>
      <ul className="list-disc list-inside my-2">
        <li>Personal Information Protection Officer: Hyunjin Roh</li>
        <li>Contact: onensix23@gmail.com</li>
      </ul>

      <p className="mt-6 text-gray-500">This Privacy Policy is effective from January 30, 2025.</p>
    </div>
  );
}
