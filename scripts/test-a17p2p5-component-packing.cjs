const assert = require("node:assert/strict");
const path = require("node:path");

const {
  createDocument,
  edge,
  family,
  graph,
  loadTsModule,
  person,
  root,
} = require("./a17p2p5-test-utils.cjs");

const packing = loadTsModule(path.join(root, "lib/family/print/tree-print-component-packing.ts"));

function sourceGraph() {
  const nodes = [
    person("a1", 0, 0),
    person("a2", 260, 0),
    family("fa", 120, 180),
    person("a-child", 120, 420),
    person("b1", 9200, 6500),
    person("b2", 9460, 6500),
    family("fb", 9320, 6680),
    person("b-child", 9320, 6920),
  ];
  const edges = [
    edge("a-couple", "couple", "person:a1", "person:a2"),
    edge("a-family-1", "family_unit", "person:a1", "family:fa"),
    edge("a-family-2", "family_unit", "person:a2", "family:fa"),
    edge("a-child", "parent_child", "family:fa", "person:a-child"),
    edge("b-couple", "couple", "person:b1", "person:b2"),
    edge("b-family-1", "family_unit", "person:b1", "family:fb"),
    edge("b-family-2", "family_unit", "person:b2", "family:fb"),
    edge("b-child", "parent_child", "family:fb", "person:b-child"),
  ];
  return graph(nodes, edges);
}

function assertPacked(result, expectedCount) {
  assert.equal(result.components.length, expectedCount);
  assert.equal(result.diagnostics.PACKED_COMPONENT_COUNT, expectedCount);
  assert.equal(result.diagnostics.MISSING_COMPONENT_COUNT, 0);
  assert.equal(result.diagnostics.COMPONENT_OVERLAP_COUNT, 0);
  assert.equal(result.document.diagnostics.CONNECTED_COMPONENT_COUNT, expectedCount);
  assert.equal(result.document.diagnostics.NODE_OVERLAP_COUNT, 0);
  assert.ok(result.diagnostics.COMPONENT_PACKING_EFFICIENCY > 0);
  assert.ok(result.diagnostics.COMPONENT_PACKING_EFFICIENCY <= 1);
  assert.ok(result.diagnostics.INTERNAL_WHITESPACE_RATIO <= result.diagnostics.BASELINE_INTERNAL_WHITESPACE_RATIO);
  assert.ok(result.diagnostics.PACKING_IMPROVEMENT >= 0);
}

function componentFor(result, componentId) {
  const component = result.components.find((item) => item.componentId === componentId);
  assert.ok(component, `missing ${componentId}`);
  return component;
}

function nodesInComponent(document, componentId) {
  return [
    ...document.people.filter((node) => node.componentId === componentId),
    ...document.families.filter((node) => node.componentId === componentId),
  ];
}

function assertNodesInsideComponentBounds(result) {
  for (const component of result.components) {
    for (const node of nodesInComponent(result.document, component.componentId)) {
      const width = "radius" in node ? node.radius * 2 : node.width;
      const height = "radius" in node ? node.radius * 2 : node.height;
      const minX = "radius" in node ? node.x - node.radius : node.x;
      const minY = "radius" in node ? node.y - node.radius : node.y;
      assert.ok(minX >= component.packedBounds.minX - 1, `${node.id} minX inside component`);
      assert.ok(minY >= component.packedBounds.minY - 1, `${node.id} minY inside component`);
      assert.ok(minX + width <= component.packedBounds.maxX + 1, `${node.id} maxX inside component`);
      assert.ok(minY + height <= component.packedBounds.maxY + 1, `${node.id} maxY inside component`);
    }
  }
}

const document = createDocument(sourceGraph());
assert.equal(document.diagnostics.CONNECTED_COMPONENT_COUNT, 2);
assert.ok(document.bounds.width > 9000);
assert.ok(document.bounds.height > 6500);

const horizontal = packing.packTreePrintComponents(document, "top-to-bottom");
assertPacked(horizontal, 2);
assertNodesInsideComponentBounds(horizontal);
assert.ok(horizontal.document.bounds.width < document.bounds.width, "horizontal packing removes raw component gap");
assert.ok(horizontal.document.bounds.height < document.bounds.height, "horizontal packing removes raw vertical drift");
assert.ok(componentFor(horizontal, "C1").packedBounds.minX <= componentFor(horizontal, "C2").packedBounds.minX);

const vertical = packing.packTreePrintComponents(document, "left-to-right");
assertPacked(vertical, 2);
assertNodesInsideComponentBounds(vertical);
assert.ok(vertical.document.bounds.width < document.bounds.width, "vertical packing removes raw component gap");
assert.ok(vertical.document.bounds.height < document.bounds.height, "vertical packing removes raw vertical drift");
assert.ok(componentFor(vertical, "C1").packedBounds.minY <= componentFor(vertical, "C2").packedBounds.minY);

console.log("[A17P2P5 Component Packing] PASS");
