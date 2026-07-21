const SAFE_IMAGE_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221%22 height=%221%22/%3E';

const isInlineImage = (value: string): boolean =>
  /^data:image\/(?:gif|jpe?g|png|webp)(?:[;,])/i.test(value.trim());

const isNetworkBearingUrl = (value: string): boolean => {
  const normalized = value.trim();
  return (
    normalized.length > 0 &&
    !normalized.startsWith('#') &&
    /^(?:[a-z][a-z\d+.-]*:|\/\/|\/|\.{1,2}\/)/i.test(normalized)
  );
};

export const sanitizeMermaidSource = (code: string): string => {
  let sanitized = code.replace(
    /<(?:script|iframe|object|embed|link|meta)\b[^>]*>[\s\S]*?<\/(?:script|iframe|object|embed)>|<(?:script|iframe|object|embed|link|meta)\b[^>]*\/?>/gi,
    ''
  );

  sanitized = sanitized.replace(
    /\s+on[a-z]+\s*=\s*(["']).*?\1/gi,
    ''
  );

  sanitized = sanitized.replace(
    /(\bimg\s*:\s*)(["'])(.*?)\2/gi,
    (match, prefix: string, quote: string, value: string) =>
      isInlineImage(value)
        ? match
        : `${prefix}${quote}${SAFE_IMAGE_PLACEHOLDER}${quote}`
  );

  sanitized = sanitized.replace(
    /(\b(?:href|link|url)\s*:\s*)(["'])(.*?)\2/gi,
    (match, prefix: string, quote: string, value: string) =>
      isNetworkBearingUrl(value) ? `${prefix}${quote}#${quote}` : match
  );

  sanitized = sanitized.replace(
    /(<(?:img|image)\b[^>]*?\b(?:src|href|xlink:href)\s*=\s*)(["'])(.*?)\2/gi,
    (match, prefix: string, quote: string, value: string) =>
      isInlineImage(value)
        ? match
        : `${prefix}${quote}${SAFE_IMAGE_PLACEHOLDER}${quote}`
  );

  sanitized = sanitized.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g,
    (match, label: string, value: string) =>
      isInlineImage(value) ? match : `[${label || 'image removed'}]`
  );

  sanitized = sanitized.replace(
    /(^\s*click\s+\S+(?:\s+(?:href|call))?\s+)(["'])(.*?)\2/gim,
    (match, prefix: string, quote: string, value: string) =>
      isNetworkBearingUrl(value) ? `${prefix}${quote}#${quote}` : match
  );

  return sanitized;
};

export const sanitizeRenderedSvg = (svg: string): string => {
  const template = document.createElement('template');
  template.innerHTML = svg;
  const svgElement = template.content.querySelector('svg');
  if (!svgElement) {
    throw new Error('Mermaid produced invalid SVG output');
  }

  let changed = false;
  svgElement
    .querySelectorAll('script, iframe, object, embed, link, meta')
    .forEach((element) => {
      element.remove();
      changed = true;
    });

  svgElement.querySelectorAll('*').forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim();
      if (name.startsWith('on') || name === 'srcdoc') {
        element.removeAttribute(attribute.name);
        changed = true;
      } else if (
        ['href', 'xlink:href', 'src'].includes(name) &&
        isNetworkBearingUrl(value)
      ) {
        element.removeAttribute(attribute.name);
        changed = true;
      } else if (
        name === 'style' &&
        /url\(\s*["']?(?:[a-z][a-z\d+.-]*:|\/\/|\/|\.{1,2}\/)/i.test(value)
      ) {
        element.removeAttribute(attribute.name);
        changed = true;
      }
    });
  });

  svgElement.querySelectorAll('style').forEach((styleElement) => {
    const css = styleElement.textContent ?? '';
    const safeCss = css
      .replace(/@import\s+[^;]+;?/gi, '')
      .replace(
        /url\(\s*["']?(?:[a-z][a-z\d+.-]*:|\/\/|\/|\.{1,2}\/)[^)]*\)/gi,
        'none'
      );
    if (safeCss !== css) {
      styleElement.textContent = safeCss;
      changed = true;
    }
  });

  return changed ? new XMLSerializer().serializeToString(svgElement) : svg;
};
