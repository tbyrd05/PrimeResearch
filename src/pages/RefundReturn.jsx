import React from 'react';
import PolicyLayout from '../components/PolicyLayout';
import { supportConfig } from '../data/supportConfig';

export default function RefundReturn() {
  return (
    <PolicyLayout
      title="Refund and Return Policy"
      intro="Because Prime Research products are sold for laboratory research use only and product integrity is important to quality control, returns and refunds are limited. This page explains how issues are handled."
      sections={[
        {
          heading: 'General Policy',
          paragraphs: [
            'All sales are generally considered final. We do not accept standard returns based on ordering mistakes, preference changes, or misuse after delivery.',
            'This policy helps maintain handling standards and protects the condition of research products supplied to all customers.',
          ],
        },
        {
          heading: 'When We May Review a Case',
          paragraphs: [
            'If one of these issues applies, contact us promptly with your order number, a description of the issue, and supporting photos when available.',
          ],
          bullets: [
            'The wrong item was received.',
            'The package arrived damaged or defective.',
            'A fulfillment error occurred on our side and a replacement is not possible.',
          ],
        },
        {
          heading: 'Reporting Window',
          paragraphs: [
            `Any delivery issue should be reported within 48 hours of receipt by emailing ${supportConfig.contactEmail}. Late claims may not be eligible for review.`,
          ],
        },
        {
          heading: 'Non-Eligible Situations',
          paragraphs: [],
          bullets: [
            'Opened or used items.',
            'Requests made without enough supporting detail.',
            'Issues caused by incorrect checkout information supplied by the customer.',
          ],
        },
      ]}
    />
  );
}
