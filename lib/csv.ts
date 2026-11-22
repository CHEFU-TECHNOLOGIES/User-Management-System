// Quoting escapes commas/newlines; the prefix prevents spreadsheet formulas.
export function csvCell(value: string) {
  const safe =
    /^[\s]*[=+@\-]/.test(value) || /^[\t\r\n]/.test(value)
      ? `'${value}`
      : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
export function downloadCsv(rows: string[][]) {
  const blob = new Blob(
    ["\uFEFF", rows.map((row) => row.map(csvCell).join(",")).join("\r\n")],
    { type: "text/csv;charset=utf-8" },
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "chefu-users-page.csv";
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
