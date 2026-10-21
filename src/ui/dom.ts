type Props = Record<string, string | number | boolean | EventListener | undefined>;
type Child = Node | string | null;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === false) continue;
    if (typeof value === 'function' && key.startsWith('on')) {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'className') {
      element.className = String(value);
    } else {
      element.setAttribute(key, value === true ? '' : String(value));
    }
  }
  element.append(...children.filter((child): child is Node | string => child !== null));
  return element;
}
