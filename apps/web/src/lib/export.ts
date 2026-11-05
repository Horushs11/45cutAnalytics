export function exportCsv(filename: string, records: Record<string, string | number | null>[]) {
  if (!records.length) return;
  const keys = Object.keys(records[0]);
  const escapeCell = (value: string | number | null) => {
    const text = value === null ? '' : String(value);
    return `"${text.replaceAll('"', '""')}"`;
  };
  const csv = '\uFEFF' + [keys.map(escapeCell).join(','), ...records.map(row => keys.map(key => escapeCell(row[key])).join(','))].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
