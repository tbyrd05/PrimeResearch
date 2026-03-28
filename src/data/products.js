export const products = [
  { id: 1, name: 'GHK-Cu', cas: '89030-95-5', purity: '99.8%', mg: '50mg', status: 'In Stock', options: [{ size: '50mg', price: '$40.00' }, { size: '100mg', price: '$60.00' }] },
  { id: 2, name: 'BPC-157', cas: '137525-51-0', purity: '99.9%', mg: '5mg', status: 'In Stock', options: [{ size: '5mg', price: '$25.00' }, { size: '10mg', price: '$45.00' }] },
  { id: 3, name: 'MT-2', cas: '910463-68-2', purity: '99.5%', mg: '10mg', status: 'In Stock', options: [{ size: '10mg', price: '$30.00' }] },
  { id: 4, name: 'Tirzepatide', cas: '2023788-19-2', purity: '99.8%', mg: '5mg', status: 'In Stock', options: [{ size: '5mg', price: '$65.00' }, { size: '10mg', price: '$105.00' }, { size: '15mg', price: '$150.00' }] },
  { id: 5, name: 'Semaglutide', cas: '910463-68-2', purity: '99.9%', mg: '2mg', status: 'In Stock', options: [{ size: '2mg', price: '$45.00' }, { size: '5mg', price: '$75.00' }] },
  { id: 6, name: 'CJC-1295 No DAC', cas: '862828-05-5', purity: '99.7%', mg: '5mg', status: 'In Stock', options: [{ size: '5mg', price: '$45.00' }] },
  { id: 13, name: 'CJC-1295 w/ DAC', cas: '864531-19-1', purity: '99.8%', mg: '5mg', status: 'In Stock', options: [{ size: '5mg', price: '$50.00' }] },
  { id: 8, name: 'Retatrutide', cas: '2381089-83-2', purity: '99.9%', mg: '10mg', status: 'In Stock', options: [{ size: '10mg', price: '$90.00' }, { size: '15mg', price: '$120.00' }, { size: '20mg', price: '$150.00' }] },
  { id: 9, name: 'Ipamorelin', cas: '170851-70-4', purity: '99.8%', mg: '2mg', status: 'In Stock', options: [{ size: '2mg', price: '$20.00' }, { size: '5mg', price: '$35.00' }] },
  { id: 12, name: 'Tesamorelin', cas: '218949-48-5', purity: '99.9%', mg: '10mg', status: 'In Stock', options: [{ size: '10mg', price: '$90.00' }, { size: '20mg', price: '$165.00' }] },
  { id: 15, name: 'BPC-157/TB-500 Blend', cas: 'N/A', purity: '99.9%', mg: '10mg', status: 'In Stock', options: [{ size: '10mg', price: '$75.00' }, { size: '20mg', price: '$130.00' }] },
  { id: 25, name: 'TB-500', cas: '77591-33-4', purity: '99.8%', mg: '5mg', status: 'In Stock', options: [{ size: '5mg', price: '$60.00' }, { size: '10mg', price: '$95.00' }] },
  { id: 26, name: 'Glow Blend (70mg)', cas: 'N/A', purity: '99.7%', mg: '70mg', status: 'In Stock', options: [{ size: '70mg', price: '$105.00' }] },
  { id: 27, name: 'Klow Blend (80mg)', cas: 'N/A', purity: '99.7%', mg: '80mg', status: 'In Stock', options: [{ size: '80mg', price: '$115.00' }] },
  { id: 28, name: 'Bacteriostatic Water', cas: 'N/A', purity: 'N/A', mg: '10mL', status: 'In Stock', options: [{ size: '10mL', price: '$10.00' }, { size: '30mL', price: '$25.00' }] },
  { id: 19, name: 'Selank', cas: '129954-34-3', purity: '99.7%', mg: '5mg', status: 'In Stock', options: [{ size: '5mg', price: '$30.00' }] },
  { id: 20, name: 'Semax', cas: '80714-61-0', purity: '99.8%', mg: '5mg', status: 'In Stock', options: [{ size: '5mg', price: '$30.00' }] },
];

export function getBasePrice(product) {
  return Number.parseFloat((product.options[0]?.price || '$0').replace('$', ''));
}
