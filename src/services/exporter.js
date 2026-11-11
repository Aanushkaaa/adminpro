import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Universal Data Exporter for SaaS Client Results
 * Allows clients to immediately export any query or action results.
 */
export const exportData = (data, filename = 'export', format = 'csv') => {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    alert('No data available to export.');
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fullFilename = `${filename}_${timestamp}`;

  // Ensure data is array of flat objects
  const exportArray = Array.isArray(data) ? data : [data];

  if (format === 'csv') {
    const csv = Papa.unparse(exportArray);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${fullFilename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else if (format === 'xlsx') {
    const worksheet = XLSX.utils.json_to_sheet(exportArray);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
    XLSX.writeFile(workbook, `${fullFilename}.xlsx`);
  } else if (format === 'json') {
    const jsonStr = JSON.stringify(exportArray, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${fullFilename}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
