import React from 'react';
import PolicyLayout from '../components/PolicyLayout';
import { supportConfig } from '../data/supportConfig';

export default function PrivacyPolicy() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      intro="Prime Research respects customer privacy and handles personal information only as needed to operate the site, process orders, and provide support. This page explains the types of information we collect and how it is used."
      sections={[
        {
          heading: 'Information We Collect',
          paragraphs: [],
          bullets: [
            'Contact details such as name, email address, phone number, and shipping information.',
            'Order-related details including purchased items, totals, and status history.',
            'Technical information such as browser details, device information, and basic site activity data.',
          ],
        },
        {
          heading: 'How Information Is Used',
          paragraphs: [],
          bullets: [
            'To process and fulfill orders.',
            'To provide shipping updates, payment follow-up, and customer support.',
            'To improve site performance, usability, and account functionality.',
            'To monitor fraud risk, payment issues, and security concerns.',
          ],
        },
        {
          heading: 'Information Sharing',
          paragraphs: [
            'Prime Research does not sell customer personal information. Information may be shared only when needed to support order fulfillment, payment confirmation, technical operations, or legal compliance.',
          ],
        },
        {
          heading: 'Data Storage and Security',
          paragraphs: [
            'We take reasonable measures to protect customer information, but no method of online storage or transmission can be guaranteed as completely secure.',
            'Customers should also help protect their information by using secure passwords and keeping account credentials private.',
          ],
        },
        {
          heading: 'Contact',
          paragraphs: [
            `If you have privacy questions or need assistance with your information, contact ${supportConfig.contactEmail}.`,
          ],
        },
      ]}
    />
  );
}
