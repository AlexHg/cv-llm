import { splitCitationSegments } from "@/domain/citation";

export const CITE_LINK_CLASS = "cv-cite-link";

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "BUTTON"]);

function hasCitation(text: string) {
  return splitCitationSegments(text).some((segment) => segment.type === "citation");
}

function wrapTextNode(node: Text) {
  const text = node.textContent ?? "";
  const segments = splitCitationSegments(text);
  if (!segments.some((segment) => segment.type === "citation")) return 0;

  const fragment = document.createDocumentFragment();
  let count = 0;

  for (const segment of segments) {
    if (segment.type === "text") {
      fragment.append(segment.value);
      continue;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = CITE_LINK_CLASS;
    button.dataset.cite = segment.citation.raw;
    button.setAttribute("aria-label", `Resaltar ${segment.citation.raw} en el CV`);
    button.textContent = segment.value;
    fragment.append(button);
    count += 1;
  }

  node.parentNode?.replaceChild(fragment, node);
  return count;
}

/** Enlaza citas ya renderizadas. Idempotente: no vuelve a envolver un link. */
export function linkifyCitationsIn(root: ParentNode) {
  const pending: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest(`.${CITE_LINK_CLASS}`)) return NodeFilter.FILTER_REJECT;
      if (!hasCitation(node.textContent ?? "")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let current = walker.nextNode();
  while (current) {
    pending.push(current as Text);
    current = walker.nextNode();
  }

  let linked = 0;
  for (const node of pending) linked += wrapTextNode(node);
  return linked;
}

export function citationRawFromClick(event: Event) {
  const target = event.target;
  if (!(target instanceof Element)) return null;
  const link = target.closest(`.${CITE_LINK_CLASS}`);
  if (!(link instanceof HTMLElement)) return null;
  return link.dataset.cite ?? null;
}
