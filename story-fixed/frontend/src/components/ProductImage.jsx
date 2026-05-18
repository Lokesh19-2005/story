// src/components/ProductImage.jsx
// Resilient product image: accepts a string, a list, or `images` from the API.
// Falls back to the icon glyph when the URL fails or no source is provided.
// Stays purely visual — no behavior changes.
import { useEffect, useState } from 'react';

export default function ProductImage({
  product,                  // optional — convenience: pass the full product
  src,                      // string  — direct override
  srcs,                     // array   — explicit gallery
  index = 0,                // pick which item from `srcs` / product.images
  alt = '',
  fallbackIcon,             // glyph fallback when image fails
  className = '',
  loading = 'lazy',
  fit = 'cover',
  style,
  iconSize,
}) {
  const list = (Array.isArray(srcs) && srcs.length)
    ? srcs
    : (Array.isArray(product?.images) && product.images.length)
      ? product.images
      : (src ? [src] : (product?.image_url ? [product.image_url] : []));

  const initial = list[Math.min(Math.max(0, index), Math.max(0, list.length - 1))] || '';
  const [url, setUrl]         = useState(initial);
  const [errored, setErrored] = useState(!initial);

  useEffect(() => {
    setUrl(initial);
    setErrored(!initial);
  }, [initial]);

  const icon = fallbackIcon || product?.icon || '\u25C9';

  if (errored || !url) {
    return (
      <span
        aria-label={alt || product?.name || 'product image'}
        className={`pi pi-fallback ${className}`}
        style={{ fontSize: iconSize, ...style }}
      >
        {icon}
      </span>
    );
  }

  return (
    <img
      src={url}
      alt={alt || product?.name || ''}
      loading={loading}
      onError={() => setErrored(true)}
      className={`pi ${className}`}
      style={{ objectFit: fit, ...style }}
    />
  );
}
