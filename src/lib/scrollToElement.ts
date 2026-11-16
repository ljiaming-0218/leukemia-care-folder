export function scrollToElement(target: HTMLElement): void {
  const header = document.querySelector<HTMLElement>(".site-header");
  const offset = (header?.getBoundingClientRect().height ?? 0) + 12;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top) });
}
