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

/**
 * Trim whitespace and treat empty / falsy values as "no source" so we
 * skip the network request entirely and go straight to the icon fallback.
 * This is what kills lingering blank tiles when an admin record had a
 * placeholder string ("", " ", "null") in image_url.
 */
function isUsableSrc(src) {
  return typeof src === 'string' && src.trim().length > 0;
}

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
  const [loaded, setLoaded]       = useState(false);
  const [errored, setErrored]     = useState(false);
  const [hoverFailed, setHoverFailed] = useState(false);
  const imgRef = useRef(null);

  // Reset transient state when the source changes (e.g. PDP gallery switch).
  useEffect(() => {
    setLoaded(false);
    setErrored(false);
  }, [src]);

  // Reset hover-image error state independently when the hover source
  // changes — otherwise a previous product's hover failure would leak
  // into the next product on a thumbnail / detail navigation.
  useEffect(() => {
    setHoverFailed(false);
  }, [hoverSrc]);

  // If the browser already cached the image, onLoad may have fired before our
  // listener attached. Sync state from the underlying element after mount.
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  const validSrc       = isUsableSrc(src);
  const showImage      = validSrc && !errored;
  // Only render the hover image when it's a usable URL, distinct from the
  // primary, and hasn't failed to load. Skipping the redundant <img> when
  // hoverSrc === src avoids a wasted CDN hit and a no-op hover swap.
  const validHoverSrc  = isUsableSrc(hoverSrc) && hoverSrc !== src;
  const showHoverImage = showImage && validHoverSrc && !hoverFailed;

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
            // React 18.3+ expects camelCase `fetchPriority`. Lowercase
            // `fetchpriority` was being filtered out by React's DOM
            // property allowlist and silently dropping the priority hint.
            fetchPriority={priority ? 'high' : 'auto'}
            draggable={false}
            onLoad={(e) => { setLoaded(true); if (onLoad) onLoad(e); }}
            onError={() => setErrored(true)}
            className="smart-img-el smart-img-primary"
            style={{
              opacity: loaded ? 1 : 0,
              objectPosition,
            }}
          />
          {showHoverImage && (
            <img
              src={hoverSrc}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              aria-hidden="true"
              className="smart-img-el smart-img-hover"
              style={{ objectPosition }}
              onError={() => setHoverFailed(true)}
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
