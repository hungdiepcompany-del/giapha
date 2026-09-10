const fs = require('fs');
const path = require('path');

let hasError = false;

function reportError(msg) {
  console.error(`[A17R Checker] FAIL: ${msg}`);
  hasError = true;
}

// 1. Check family-node-card.tsx handles
const nodeCardPath = path.join(__dirname, '..', 'components', 'tree', 'family-node-card.tsx');
const nodeCardContent = fs.readFileSync(nodeCardPath, 'utf8');

if (!nodeCardContent.includes('id="lineage-top"')) reportError('PersonCard missing lineage-top handle');
if (!nodeCardContent.includes('id="lineage-bottom"')) reportError('PersonCard missing lineage-bottom handle');
if (!nodeCardContent.includes('id="union-left"')) reportError('PersonCard missing union-left handle');
if (!nodeCardContent.includes('id="union-right"')) reportError('PersonCard missing union-right handle');
if (!nodeCardContent.includes('id="parent-top"')) reportError('FamilyUnitCard missing parent-top handle');
if (!nodeCardContent.includes('id="children-bottom"')) reportError('FamilyUnitCard missing children-bottom handle');

// 2. Check family-relationship-edge.tsx
const edgePath = path.join(__dirname, '..', 'components', 'tree', 'family-relationship-edge.tsx');
if (!fs.existsSync(edgePath)) {
  reportError('family-relationship-edge.tsx is missing');
} else {
  const edgeContent = fs.readFileSync(edgePath, 'utf8');
  if (!edgeContent.includes('getSmoothStepPath')) reportError('family-relationship-edge.tsx should use getSmoothStepPath');
  if (!edgeContent.includes('borderRadius: 0')) reportError('family-relationship-edge.tsx should have borderRadius: 0 for orthogonal routing');
}

// 3. Check viewer and editor edgeTypes registration
const editorPath = path.join(__dirname, '..', 'components', 'tree', 'family-tree-editor.tsx');
const viewerPath = path.join(__dirname, '..', 'components', 'tree', 'family-tree-viewer.tsx');
const editorContent = fs.readFileSync(editorPath, 'utf8');
const viewerContent = fs.readFileSync(viewerPath, 'utf8');

if (!editorContent.includes('edgeTypes={edgeTypes}')) reportError('Editor missing edgeTypes registration');
if (!viewerContent.includes('edgeTypes={edgeTypes}')) reportError('Viewer missing edgeTypes registration');
if (editorContent.includes('function edgeStyle')) reportError('Editor should not have edgeStyle function anymore');
if (viewerContent.includes('function edgeStyle')) reportError('Viewer should not have edgeStyle function anymore');
if (!editorContent.includes('hasValidSavedPositions')) reportError('Editor should check hasValidSavedPositions');

// 4. Check tree-graph-builder.ts couple dedupe and enum hiding
const builderPath = path.join(__dirname, '..', 'lib', 'family', 'tree-graph-builder.ts');
const builderContent = fs.readFileSync(builderPath, 'utf8');
if (!builderContent.includes('hiddenLabels.has(label)')) reportError('tree-graph-builder.ts missing enum hiding logic');
if (!builderContent.includes('couple.family_id && familyNodeIds.has(couple.family_id)')) reportError('tree-graph-builder.ts missing couple deduplication');

// 5. Check tree-layout-elk.ts family size
const elkPath = path.join(__dirname, '..', 'lib', 'family', 'tree-layout-elk.ts');
const elkContent = fs.readFileSync(elkPath, 'utf8');
if (!elkContent.includes('const FAMILY_WIDTH = 24')) reportError('tree-layout-elk.ts should have FAMILY_WIDTH = 24');

if (hasError) {
  process.exit(1);
} else {
  console.log('[A17R Checker] PASS: All checks completed successfully.');
}
