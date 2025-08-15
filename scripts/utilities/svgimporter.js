// Function to expand relative URLs to absolute URLs
function expandURL(url) {
    if(url.startsWith('http://') || url.startsWith('https://'))
        return url; // Already absolute
    else if(url.startsWith('/'))
        return window.location.origin + url; // Absolute path from root
    else
        return window.location.href + '/../' + url; // Relative path
}

// Replace all <svgfile> elements with their SVG content
function reimportSVGFiles() {
  document.querySelectorAll('svgfile').forEach(async (el) => {
    if(el.hasAttribute("noimport")) return; // Skip elements with noimport attribute
    const src = el.getAttribute('src');
    const response = await fetch(expandURL(src));
    const svgText = await response.text();
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
    const svgEl = svgDoc.documentElement;

    // Copy attributes from svgfile to svg element (excluding src)
    [...el.attributes].forEach(attr => {
      if (attr.name !== 'src' && attr.name !== 'deferimport') {
        svgEl.setAttribute(attr.name, attr.value);
      }
    });

    el.replaceWith(svgEl);
  });
}

document.addEventListener("DOMContentLoaded", reimportSVGFiles);