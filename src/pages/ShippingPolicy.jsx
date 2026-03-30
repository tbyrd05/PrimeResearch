import React from 'react';
import PolicyLayout from '../components/PolicyLayout';
import { supportConfig } from '../data/supportConfig';

export default function ShippingPolicy() {
  return (
    <PolicyLayout
      title="Shipping Policy"
      intro="Prime Research processes and ships research orders as securely and consistently as possible. This page explains our standard shipping method, order handling expectations, and how customers can contact us if they need an update."
      sections={[
        {
          heading: 'Processing and Dispatch',
          paragraphs: [
            'Orders are reviewed and prepared in the order they are received. Processing times may vary depending on order volume, stock confirmation, payment confirmation, or carrier schedules.',
            'A shipping confirmation will be sent once the order has been dispatched. Delivery timing begins after the package has been handed off to the carrier.',
          ],
        },
        {
          heading: 'Standard Shipping',
          paragraphs: ['Prime Research currently offers standard shipping only.'],
          bullets: [
            'Standard shipping is the only shipping option available at checkout.',
            'Once shipped, standard delivery typically arrives within 2 to 5 business days.',
            'Transit times are estimates and may shift because of carrier delays, weather, holidays, or destination-related issues.',
          ],
        },
        {
          heading: 'Address Accuracy',
          paragraphs: [
            'Customers are responsible for making sure the shipping address entered at checkout is complete and accurate.',
            `If an incorrect address is submitted, please contact us as quickly as possible at ${supportConfig.contactEmail}. We cannot guarantee changes once an order has already been processed or shipped.`,
          ],
        },
        {
          heading: 'Order Support',
          paragraphs: [
            `If you need help with a shipment, include your order number and contact ${supportConfig.contactEmail}. We will review the order status and provide an update when available.`,
          ],
        },
      ]}
    />
  );
}
