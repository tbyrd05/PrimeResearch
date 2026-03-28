import React from 'react';

const imageMap = {
  'GHK-Cu': '/normalized/ghk50.png',
  'BPC-157': '/normalized/bpc_157.png',
  'MT-2': '/normalized/mt2.png',
  Tirzepatide: '/normalized/tirz5.png',
  Semaglutide: '/normalized/sema5.png',
  'CJC-1295 No DAC': '/normalized/cjcNdac.png',
  'CJC-1295 w/ DAC': '/normalized/cjcWdac.png',
  Retatrutide: '/normalized/reta.png',
  Ipamorelin: '/normalized/ipamorelin.png',
  Tesamorelin: '/normalized/tesa10.png',
  'BPC-157/TB-500 Blend': '/normalized/bpc-tb-blend.png',
  'TB-500': '/normalized/tb500.png',
  'Glow Blend (70mg)': '/normalized/glow70.png',
  'Klow Blend (80mg)': '/normalized/klow80.png',
  'Bacteriostatic Water': '/normalized/bacwater.png',
  Selank: '/normalized/selank5.png',
  Semax: '/normalized/semax5.png',
};

export default function ProductArtwork({ product, compact = false, className = '', imageClassName = '' }) {
  const src = imageMap[product?.name] || '/normalized/klow80.png';

  return (
    <div
      className={[
        'relative overflow-hidden bg-white',
        compact ? 'aspect-[4/4.7]' : 'aspect-[4/4.9]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="absolute inset-0 flex items-center justify-center p-1 sm:p-2">
        <img
          src={src}
          alt={product?.name || 'Prime Research vial'}
          className={[
            'block h-auto w-auto max-h-[112%] max-w-[100%] object-contain object-center',
            imageClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        />
      </div>
    </div>
  );
}
