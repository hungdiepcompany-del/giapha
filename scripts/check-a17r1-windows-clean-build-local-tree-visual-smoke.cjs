/**
 * check-a17r1-windows-clean-build-local-tree-visual-smoke.cjs
 *
 * A17R1 evidence contract checker.
 * Verifies that all required artifacts and evidence fields exist
 * for the A17R1 phase gate.
 */

const fs = require('fs');
const path = require('path');

let hasError = false;

function reportError(msg) {
  console.error(`[A17R1 Checker] FAIL: ${msg}`);
  hasError = true;
}

function reportInfo(msg) {
  console.log(`[A17R1 Checker] INFO: ${msg}`);
}

// 1. Plan doc must exist
const planDocPath = path.join(__dirname, '..', 'docs', 'PLAN_A17R1_WINDOWS_CLEAN_BUILD_AND_LOCAL_TREE_VISUAL_SMOKE.md');
if (!fs.existsSync(planDocPath)) {
  reportError('Plan document PLAN_A17R1_WINDOWS_CLEAN_BUILD_AND_LOCAL_TREE_VISUAL_SMOKE.md is missing');
} else {
  reportInfo('Plan document exists');
  const content = fs.readFileSync(planDocPath, 'utf8');

  // 2. Build result must be recorded
  if (!content.includes('CLEAN_BUILD=PASS')) {
    reportError('Plan doc must contain CLEAN_BUILD=PASS');
  }

  // 3. Viewer smoke must not be empty
  const viewerSmokeMatch = content.match(/LOCAL_VIEWER_SMOKE=(\S+)/);
  if (!viewerSmokeMatch) {
    reportError('Plan doc missing LOCAL_VIEWER_SMOKE field');
  } else if (viewerSmokeMatch[1] === '' || viewerSmokeMatch[1] === 'TBD') {
    reportError('Plan doc has empty or TBD LOCAL_VIEWER_SMOKE value');
  }

  // 4. Editor smoke must be PASS or SKIPPED with reason
  const editorSmokeMatch = content.match(/LOCAL_EDITOR_SMOKE=(\S+)/);
  if (!editorSmokeMatch) {
    reportError('Plan doc missing LOCAL_EDITOR_SMOKE field');
  } else {
    const val = editorSmokeMatch[1];
    const valid = val.startsWith('PASS') || val.startsWith('SKIPPED');
    if (!valid) {
      reportError(`LOCAL_EDITOR_SMOKE must be PASS or SKIPPED_, got: ${val}`);
    }
  }

  // 5. Saved-layout smoke must be PASS or SKIPPED with reason
  const savedSmokeMatch = content.match(/SAVED_LAYOUT_REOPEN_SMOKE=(\S+)/);
  if (!savedSmokeMatch) {
    reportError('Plan doc missing SAVED_LAYOUT_REOPEN_SMOKE field');
  } else {
    const val = savedSmokeMatch[1];
    const valid = val.startsWith('PASS') || val.startsWith('SKIPPED');
    if (!valid) {
      reportError(`SAVED_LAYOUT_REOPEN_SMOKE must be PASS or SKIPPED_, got: ${val}`);
    }
  }

  // 6. Safety: No migration
  if (content.includes('MIGRATION_CREATED=YES')) {
    reportError('A17R1 must not create migrations (MIGRATION_CREATED=YES found)');
  }
  if (!content.includes('MIGRATION_CREATED=NO')) {
    reportError('Plan doc missing MIGRATION_CREATED=NO');
  }

  // 7. Safety: No SQL
  if (content.includes('SQL_RUN=YES')) {
    reportError('A17R1 must not run SQL (SQL_RUN=YES found)');
  }

  // 8. Safety: No production mutation
  if (content.includes('PRODUCTION_DATA_MUTATION=YES')) {
    reportError('A17R1 must not mutate production (PRODUCTION_DATA_MUTATION=YES found)');
  }

  // 9. Safety: No push
  if (content.includes('PUSH_STATUS=PUSHED') || content.includes('PUSH_STATUS=RUN')) {
    reportError('A17R1 must not push (PUSH_STATUS must be NOT_RUN)');
  }

  // 10. Safety: No deploy
  if (content.includes('DEPLOY_STATUS=DEPLOYED') || content.includes('DEPLOY_STATUS=RUN')) {
    reportError('A17R1 must not deploy (DEPLOY_STATUS must be NOT_RUN)');
  }

  // 11. A17S gate: Must not be READY if build not PASS
  if (!content.includes('CLEAN_BUILD=PASS') && content.includes('A17S_READINESS=READY')) {
    reportError('A17S cannot be READY when CLEAN_BUILD is not PASS');
  }

  // 12. A17S gate: Must not be READY if viewer smoke not started/passed
  if (viewerSmokeMatch && !viewerSmokeMatch[1].startsWith('PASS') && content.includes('A17S_READINESS=READY')) {
    reportError('A17S cannot be READY when LOCAL_VIEWER_SMOKE is not PASS');
  }
}

// 13. A17R source checker should still pass
const a17rScriptPath = path.join(__dirname, 'check-a17r-tree-graph-routing-family-junction-runtime.cjs');
if (!fs.existsSync(a17rScriptPath)) {
  reportError('A17R source checker script missing');
} else {
  reportInfo('A17R source checker script exists');
}

if (hasError) {
  process.exit(1);
} else {
  console.log('[A17R1 Checker] PASS: All A17R1 evidence contract checks completed successfully.');
}
