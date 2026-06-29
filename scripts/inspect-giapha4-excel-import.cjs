const fs = require("node:fs");
const path = require("node:path");

const inputPath = process.argv[2] || process.env.GIAPHA4_EXCEL_PATH || "";

function maskValue(value) {
  if (value === null || value === undefined || value === "") return null;
  const text = String(value).trim();
  if (!text) return null;
  if (/^\d{4}([/-]\d{1,2})?([/-]\d{1,2})?$/.test(text)) return "DATE_MASKED";
  if (/^\d+$/.test(text)) return "NUMBER_MASKED";
  return `TEXT_MASKED_LEN_${Math.min(text.length, 64)}`;
}

function detectParser() {
  try {
    return { name: "xlsx", module: require("xlsx") };
  } catch {
    // Optional dependency only. A-16 must not install it without owner approval.
  }

  try {
    return { name: "exceljs", module: require("exceljs") };
  } catch {
    // Optional dependency only. A-16 must not install it without owner approval.
  }

  return null;
}

function normalizeHeader(value, index) {
  const text = value === null || value === undefined ? "" : String(value).trim();
  return text || `__blank_column_${index + 1}`;
}

function inspectWithXlsx(filePath, xlsx) {
  const workbook = xlsx.readFile(filePath, {
    cellDates: false,
    cellText: true,
    WTF: false,
  });

  const sheets = workbook.SheetNames.map((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, {
      header: 1,
      blankrows: false,
      defval: "",
      raw: false,
    });
    const headerRow = Array.isArray(rows[0]) ? rows[0] : [];
    const headers = headerRow.map(normalizeHeader);
    const firstDataRow = Array.isArray(rows[1]) ? rows[1] : [];
    const maskedSample = Object.fromEntries(
      headers.slice(0, 24).map((header, index) => [header, maskValue(firstDataRow[index])]),
    );

    return {
      sheet_name: sheetName,
      row_count_including_header: rows.length,
      data_row_count_estimate: Math.max(rows.length - 1, 0),
      column_count: headers.length,
      headers,
      masked_sample_shape: maskedSample,
    };
  });

  return {
    status: "OK_READ_ONLY_MASKED_PREVIEW",
    parser: "xlsx",
    sheets,
    warning_count: 0,
    warnings: [],
  };
}

async function inspectWithExcelJs(filePath, ExcelJS) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheets = workbook.worksheets.map((worksheet) => {
    const firstRow = worksheet.getRow(1);
    const headers = [];
    firstRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      headers[colNumber - 1] = normalizeHeader(cell.value, colNumber - 1);
    });

    const secondRow = worksheet.getRow(2);
    const maskedSample = Object.fromEntries(
      headers.slice(0, 24).map((header, index) => [
        header,
        maskValue(secondRow.getCell(index + 1).value),
      ]),
    );

    return {
      sheet_name: worksheet.name,
      row_count_including_header: worksheet.rowCount,
      data_row_count_estimate: Math.max(worksheet.rowCount - 1, 0),
      column_count: headers.length,
      headers,
      masked_sample_shape: maskedSample,
    };
  });

  return {
    status: "OK_READ_ONLY_MASKED_PREVIEW",
    parser: "exceljs",
    sheets,
    warning_count: 0,
    warnings: [],
  };
}

async function main() {
  if (!inputPath) {
    console.log(
      JSON.stringify(
        {
          status: "SAFE_SKIP_NO_INPUT_PATH",
          input_contract: "Set GIAPHA4_EXCEL_PATH or pass a file path argument.",
          printed_pii: false,
          wrote_output_file: false,
          db_write: false,
        },
        null,
        2,
      ),
    );
    return;
  }

  const resolvedPath = path.resolve(inputPath);
  if (!fs.existsSync(resolvedPath)) {
    console.log(
      JSON.stringify(
        {
          status: "SAFE_SKIP_INPUT_FILE_NOT_FOUND",
          input_path: resolvedPath,
          printed_pii: false,
          wrote_output_file: false,
          db_write: false,
        },
        null,
        2,
      ),
    );
    return;
  }

  const stat = fs.statSync(resolvedPath);
  const ext = path.extname(resolvedPath).toLowerCase();
  const parser = detectParser();

  if (![".xls", ".xlsx"].includes(ext)) {
    console.log(
      JSON.stringify(
        {
          status: "SAFE_SKIP_UNSUPPORTED_EXTENSION",
          file_metadata: {
            extension: ext,
            size_bytes: stat.size,
          },
          supported_extensions: [".xls", ".xlsx"],
          printed_pii: false,
          wrote_output_file: false,
          db_write: false,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (!parser) {
    console.log(
      JSON.stringify(
        {
          status: "SAFE_SKIP_EXCEL_DEPENDENCY_MISSING",
          reason:
            "No xlsx or exceljs dependency is installed. A-16 does not add dependencies without owner approval.",
          file_metadata: {
            extension: ext,
            size_bytes: stat.size,
          },
          printed_pii: false,
          wrote_output_file: false,
          db_write: false,
        },
        null,
        2,
      ),
    );
    return;
  }

  const result =
    parser.name === "xlsx"
      ? inspectWithXlsx(resolvedPath, parser.module)
      : await inspectWithExcelJs(resolvedPath, parser.module);

  console.log(
    JSON.stringify(
      {
        ...result,
        file_metadata: {
          extension: ext,
          size_bytes: stat.size,
        },
        printed_pii: false,
        wrote_output_file: false,
        db_write: false,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        status: "FAILED_READ_ONLY_INSPECTION",
        error: error instanceof Error ? error.message : String(error),
        printed_pii: false,
        wrote_output_file: false,
        db_write: false,
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
