export type TreePrintSurface = "screen-preview" | "print-document";
export type TreePrintMedia = "screen" | "print";

export const TREE_PRINT_DOM_ATTRIBUTES = {
  page: "data-tree-print-page",
  routeContent: "data-tree-print-route-content",
  root: "data-tree-print-root",
  screenPreview: "data-tree-print-screen-preview",
  documentRoot: "data-tree-print-document-root",
  document: "data-tree-print-document",
  pageStyle: "data-tree-print-page-style",
  temporaryRoot: "data-tree-print-temporary-root",
  primaryContent: "data-tree-print-primary-content",
} as const;

export const TREE_PRINT_DOM_SELECTORS = {
  page: `[${TREE_PRINT_DOM_ATTRIBUTES.page}]`,
  routeContent: `[${TREE_PRINT_DOM_ATTRIBUTES.routeContent}]`,
  root: `[${TREE_PRINT_DOM_ATTRIBUTES.root}]`,
  screenPreview: `[${TREE_PRINT_DOM_ATTRIBUTES.screenPreview}]`,
  documentRoot: `[${TREE_PRINT_DOM_ATTRIBUTES.documentRoot}]`,
  document: `[${TREE_PRINT_DOM_ATTRIBUTES.document}]`,
  pageStyle: `[${TREE_PRINT_DOM_ATTRIBUTES.pageStyle}]`,
  temporaryRoot: `[${TREE_PRINT_DOM_ATTRIBUTES.temporaryRoot}]`,
  primaryContent: `[${TREE_PRINT_DOM_ATTRIBUTES.primaryContent}]`,
} as const;

export const TREE_PRINT_SINGLETON_CONTRACT = {
  screen: {
    "screen-preview": true,
    "print-document": false,
  },
  print: {
    "screen-preview": false,
    "print-document": true,
  },
} as const satisfies Record<TreePrintMedia, Record<TreePrintSurface, boolean>>;

export function isTreePrintSurfaceVisible(media: TreePrintMedia, surface: TreePrintSurface): boolean {
  return TREE_PRINT_SINGLETON_CONTRACT[media][surface];
}

export function hasForcedTreePrintPageBreak(cssText: string): boolean {
  return /\b(?:break-before|break-after)\s*:\s*(?:page|always)\b/i.test(cssText)
    || /\bpage-break-(?:before|after)\s*:\s*(?:always|left|right)\b/i.test(cssText);
}
