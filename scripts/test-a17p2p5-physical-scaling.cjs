const assert = require("node:assert/strict");
const path = require("node:path");

const {
  baseLargeFormatInput,
  createDocument,
  edge,
  family,
  graph,
  loadTsModule,
  person,
  root,
} = require("./a17p2p5-test-utils.cjs");

const largeFormat = loadTsModule(path.join(root, "lib/family/print/tree-print-large-format.ts"));

function sourceGraph() {
  const nodes = [
    person("parent-a", 0, 0),
    person("parent-b", 260, 0),
    family("parents", 120, 180),
    person("child-a", 0, 430),
    person("child-b", 260, 430),
    person("child-c", 520, 430),
  ];
  const edges = [
    edge("parents-couple", "couple", "person:parent-a", "person:parent-b"),
    edge("parent-a-family", "family_unit", "person:parent-a", "family:parents"),
    edge("parent-b-family", "family_unit", "person:parent-b", "family:parents"),
    edge("child-a", "parent_child", "family:parents", "person:child-a"),
    edge("child-b", "parent_child", "family:parents", "person:child-b"),
    edge("child-c", "parent_child", "family:parents", "person:child-c"),
  ];
  return graph(nodes, edges);
}

function warningCodes(plan) {
  return new Set(plan.warnings.map((issue) => issue.code));
}

function blockerCodes(plan) {
  return new Set(plan.blockers.map((issue) => issue.code));
}

const document = createDocument(sourceGraph());

const fullRoll = largeFormat.createTreePrintLargeFormatPlan(baseLargeFormatInput(document, {
  mode: "LARGE_FORMAT_FULL_TREE",
  orientation: "landscape",
  sizingStrategy: "USE_FULL_ROLL_WIDTH",
  mediaWidthPreset: 1500,
}));
assert.equal(fullRoll.resolvedOrientation, "landscape");
assert.equal(fullRoll.finishedHeightMm, 1500);
assert.equal(fullRoll.mediaWidthUsagePercent, 100);
assert.equal(fullRoll.finishedWidthMm > fullRoll.finishedHeightMm, true);
assert.equal(fullRoll.treeContentWidthMm <= fullRoll.printableWidthMm + 0.1, true);
assert.equal(fullRoll.treeContentHeightMm <= fullRoll.printableHeightMm + 0.1, true);
assert.equal(blockerCodes(fullRoll).has("TREE_OUTSIDE_SAFE_AREA"), false);

const targetFont = largeFormat.createTreePrintLargeFormatPlan(baseLargeFormatInput(document, {
  mode: "LARGE_FORMAT_FULL_TREE",
  orientation: "landscape",
  sizingStrategy: "TARGET_FONT_SIZE",
  targetFontSizePt: 18,
  mediaWidthPreset: 1500,
}));
assert.ok(targetFont.finishedHeightMm <= 1500);
assert.ok(targetFont.actualFontSizePt >= 17.95);
assert.equal(blockerCodes(targetFont).has("TARGET_FONT_SIZE_NOT_REACHED"), false);

const cappedBranch = largeFormat.createTreePrintLargeFormatPlan(baseLargeFormatInput(document, {
  mode: "LARGE_FORMAT_BRANCH",
  orientation: "landscape",
  sizingStrategy: "TARGET_FONT_SIZE",
  targetFontSizePt: 30,
  branchNoUpscale: true,
  maximumUpscaleFontPt: 24,
}));
assert.equal(cappedBranch.mode, "LARGE_FORMAT_BRANCH");
assert.equal(cappedBranch.branchNoUpscale, true);
assert.equal(cappedBranch.targetFontSizePt, 24);
assert.ok(cappedBranch.actualFontSizePt <= 24.05);
assert.ok(cappedBranch.actualFontSizePt >= 23.95);

const uncappedBranch = largeFormat.createTreePrintLargeFormatPlan(baseLargeFormatInput(document, {
  mode: "LARGE_FORMAT_BRANCH",
  orientation: "landscape",
  sizingStrategy: "TARGET_FONT_SIZE",
  targetFontSizePt: 30,
  branchNoUpscale: false,
  maximumUpscaleFontPt: 24,
}));
assert.equal(uncappedBranch.branchNoUpscale, false);
assert.equal(uncappedBranch.targetFontSizePt, 30);
assert.ok(uncappedBranch.actualFontSizePt >= 29.95);

const branchFullRoll = largeFormat.createTreePrintLargeFormatPlan(baseLargeFormatInput(document, {
  mode: "LARGE_FORMAT_BRANCH",
  orientation: "landscape",
  sizingStrategy: "USE_FULL_ROLL_WIDTH",
  branchNoUpscale: true,
  maximumUpscaleFontPt: 24,
}));
assert.equal(warningCodes(branchFullRoll).has("BRANCH_UPSCALE_EXCEEDS_RECOMMENDED_MAX"), true);

const tooShort = largeFormat.createTreePrintLargeFormatPlan(baseLargeFormatInput(document, {
  mode: "LARGE_FORMAT_FULL_TREE",
  orientation: "portrait",
  lengthMode: "CUSTOM_LENGTH",
  customLengthMm: 500,
}));
assert.equal(
  blockerCodes(tooShort).has("CUSTOM_LENGTH_BELOW_AUTO_LENGTH") ||
    blockerCodes(tooShort).has("ORIENTATION_DIMENSION_MISMATCH"),
  true,
);

assert.equal(largeFormat.TREE_PRINT_DEFAULT_FULL_TREE_SIZING, "USE_FULL_ROLL_WIDTH");
assert.equal(largeFormat.TREE_PRINT_DEFAULT_BRANCH_SIZING, "TARGET_FONT_SIZE");
assert.equal(largeFormat.TREE_PRINT_DEFAULT_BRANCH_TARGET_FONT_SIZE_PT, 18);
assert.equal(largeFormat.TREE_PRINT_BRANCH_MAX_RECOMMENDED_UPSCALE_FONT_PT, 24);
assert.equal(largeFormat.TREE_PRINT_DEFAULT_BRANCH_NO_UPSCALE, true);

console.log("[A17P2P5 Physical Scaling] PASS");
