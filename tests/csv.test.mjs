import assert from 'node:assert/strict';
import { test } from 'node:test';
import { csvCell } from '../lib/csv.ts';

test('CSV preserves embedded quotes, separators, and line breaks in one cell', () => {
  assert.equal(csvCell('Taylor, "Admin"\nExample'), '"Taylor, ""Admin""\nExample"');
});

test('untrusted spreadsheet formulas cannot execute when an export is opened', () => {
  for (const value of ['=HYPERLINK("https://example.test")', '+SUM(1,2)', '-1+2', '@SUM(1)', '  =1', '\t=1', '\r=1']) {
    assert.ok(csvCell(value).startsWith('"\''), value);
  }
  assert.equal(csvCell('taylor@example.test'), '"taylor@example.test"');
});
