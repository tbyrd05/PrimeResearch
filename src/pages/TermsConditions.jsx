import React from 'react';
import PolicyLayout from '../components/PolicyLayout';
import { supportConfig } from '../data/supportConfig';

export default function TermsConditions() {
  return (
    <PolicyLayout
      title="Terms and Conditions"
      intro="These Terms and Conditions govern use of the Prime Research website and any orders placed through it. By accessing the site or placing an order, customers agree to these terms."
      sections={[
        {
          heading: 'Research Use Only',
          paragraphs: [
            'All products offered by Prime Research are sold strictly for laboratory, analytical, and research purposes only.',
            'Customers are responsible for ensuring that all products are handled, stored, and used in compliance with applicable laws, regulations, and safe laboratory practices.',
          ],
        },
        {
          heading: 'Orders and Availability',
          paragraphs: [
            'Product listings, pricing, and availability may be updated at any time without prior notice.',
            'We reserve the right to refuse, cancel, or limit any order when necessary for compliance, fraud prevention, stock management, or other operational reasons.',
          ],
        },
        {
          heading: 'Payment and Verification',
          paragraphs: [
            'Orders may require payment verification before shipment. Prime Research may delay or cancel fulfillment when payment cannot be confirmed.',
            'Customers are responsible for submitting accurate payment and contact information during checkout.',
          ],
        },
        {
          heading: 'Site Use',
          paragraphs: [],
          bullets: [
            'Do not misuse, disrupt, or attempt unauthorized access to the website.',
            'Do not use the site for unlawful activity or fraudulent transactions.',
            'Do not submit false account details, order information, or payment claims.',
          ],
        },
        {
          heading: 'Limitation of Responsibility',
          paragraphs: [
            'Prime Research provides the website and products on an as-available basis. We do not guarantee uninterrupted site availability, carrier timelines, or outcomes outside our control.',
            `Questions about these terms can be directed to ${supportConfig.contactEmail}.`,
          ],
        },
      ]}
    />
  );
}
