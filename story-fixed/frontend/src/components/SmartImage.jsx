// src/components/SmartImage.jsx
// Premium image primitive for STORY — handles lazy loading, loading skeleton,
// graceful fallback, smooth fade-in, and consistent aspect ratio (no CLS).
//
// Props:
//   src           string   primary image URL
//   hoverSrc      string?  optional secondary image revealed on parent :hover
//   alt           string   accessible alt text
//   aspectRatio   string   CSS aspect-ratio (default '3/4')
//   objectPosition string  CSS object-position (default 'center')
//   fallbackIcon  string?  glyph rendered when src missing or errored
//   priority      bool     above-the-fold? -> eager + high fetchpriority
//   className     string?  extra classes on wrapper
//   style         object?  extra inline styles on wrapper
//   onLoad        fn?      forwarded load handler

import { useEffect, useRef, useState } from 'react';

export default function SmartImage({
  src,
  hoverSrc = '',
  alt = '',
  aspectRatio = '3/4',
  objectPosition = 'center',
  fallbackIcon = '\u25C9',
  priority = false,
  className = '',
  style,
  onLoad,
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef(null);

  // Reset transient state when the source changes (e.g. PDP gallery switch).
  useEffect(() => {
    setLoaded(false);
    setErrored(false);
  }, [src]);

  // If the browser already cached the image, onLoad may have fired before our
  // listener attached. Sync state from the underlying element after mount.
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  const showImage = Boolean(src) && !errored;

  return (
    <div
      className={`smart-img${className ? ' ' + className : ''}`}
      style={{ aspectRatio, ...style }}
    >
      {showImage ? (
        <>
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchpriority={priority ? 'high' : 'auto'}
            draggable={false}
            onLoad={(e) => { setLoaded(true); if (onLoad) onLoad(e); }}
            onError={() => setErrored(true)}
            className="smart-img-el smart-img-primary"
            style={{
              opacity: loaded ? 1 : 0,
              objectPosition,
            }}
          />
          {hoverSrc && (
            <img
              src={hoverSrc}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              aria-hidden="true"
              className="smart-img-el smart-img-hover"
              style={{ objectPosition }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          {!loaded && <div className="smart-img-skel" aria-hidden="true" />}
        </>
      ) : (
        <div className="smart-img-fallback" role="img" aria-label={alt}>
          <span className="smart-img-fallback-icon">{fallbackIcon}</span>
        </div>
      )}
    </div>
  );
}
