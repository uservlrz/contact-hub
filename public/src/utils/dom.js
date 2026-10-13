/**
 * Construtor de elementos DOM. Textos entram sempre como nós de texto,
 * nunca como HTML: a interface não é vulnerável a XSS por construção.
 */
export function h(tag, props = {}, ...children) {
  const element = document.createElement(tag);

  for (const [key, value] of Object.entries(props ?? {})) {
    if (value == null || value === false) continue;
    if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'class') {
      element.className = value;
    } else {
      element.setAttribute(key, value === true ? '' : value);
    }
  }

  element.append(...children.flat().filter((child) => child != null && child !== false));
  return element;
}

export function debounce(fn, delayMs) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}
