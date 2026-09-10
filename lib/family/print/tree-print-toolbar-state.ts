import type {
  TreePrintDensity,
  TreePrintPageFrame,
} from "@/lib/family/print/tree-print-model";

export type TreePrintViewMode = "fit-tree" | "fit-width" | "default" | "custom";
export type TreePrintViewportAction = "zoom-in" | "zoom-out" | "reset" | null;
export type TreePrintViewportOperation =
  | "fit-tree"
  | "fit-width"
  | "zoom-in"
  | "zoom-out"
  | "wheel-zoom"
  | "pan"
  | "reset";

export type TreePrintToolbarState = {
  viewMode: TreePrintViewMode;
  scale: number;
  showPageFrame: boolean;
  showDiagnostics: boolean;
  density: TreePrintDensity;
  pageFrame: TreePrintPageFrame;
  lastAction: TreePrintViewportAction;
};

export type TreePrintToolbarStatus = {
  viewModeLabel: string;
  zoomLabel: string;
  pageFrameLabel: string;
  diagnosticsLabel: string;
  densityLabel: string;
};

export function viewModeLabel(mode: TreePrintViewMode) {
  if (mode === "fit-tree") return "Fit toàn cây";
  if (mode === "fit-width") return "Fit chiều rộng";
  if (mode === "custom") return "Tùy chỉnh";
  return "Mặc định";
}

export function densityLabel(density: TreePrintDensity) {
  return density === "compact" ? "Tối giản" : "Tiêu chuẩn";
}

export function pageFrameLabel(frame: TreePrintPageFrame, enabled: boolean) {
  if (!enabled || frame === "none") return "Khung trang tắt";
  if (frame === "a3-landscape") return "A3 ngang";
  if (frame === "a1-landscape") return "A1 ngang";
  return "A0 ngang";
}

export function diagnosticsLabel(enabled: boolean) {
  return enabled ? "Chẩn đoán bật" : "Chẩn đoán tắt";
}

export function zoomPercentLabel(scale: number) {
  return `${Math.round(scale * 100)}%`;
}

export function buildTreePrintToolbarStatus(
  state: TreePrintToolbarState,
): TreePrintToolbarStatus {
  return {
    viewModeLabel: viewModeLabel(state.viewMode),
    zoomLabel: zoomPercentLabel(state.scale),
    pageFrameLabel: pageFrameLabel(state.pageFrame, state.showPageFrame),
    diagnosticsLabel: diagnosticsLabel(state.showDiagnostics),
    densityLabel: densityLabel(state.density),
  };
}

export function isFitModeActive(
  currentMode: TreePrintViewMode,
  mode: Extract<TreePrintViewMode, "fit-tree" | "fit-width">,
) {
  return currentMode === mode;
}

export function nextTreePrintViewMode(
  operation: TreePrintViewportOperation,
): TreePrintViewMode {
  if (operation === "fit-tree") return "fit-tree";
  if (operation === "fit-width") return "fit-width";
  if (operation === "reset") return "default";
  return "custom";
}

export function fitModesAreMutuallyExclusive(mode: TreePrintViewMode) {
  return !(isFitModeActive(mode, "fit-tree") && isFitModeActive(mode, "fit-width"));
}
