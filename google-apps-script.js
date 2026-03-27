/**
 * Melbourne Beach Landscape Survey — Google Apps Script
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com and create a new project
 * 2. Paste this entire file into Code.gs
 * 3. Click Deploy > New deployment
 * 4. Choose "Web app" as the type
 * 5. Set "Execute as" to "Me"
 * 6. Set "Who has access" to "Anyone"
 * 7. Click Deploy and copy the Web App URL
 * 8. Paste that URL into SHEET_ENDPOINT in index.html
 *
 * The script will auto-create a Google Sheet named "Melbourne Beach Survey Responses"
 * in your Google Drive on first submission.
 */

var SHEET_NAME = 'Melbourne Beach Survey Responses';

// Column order for the sheet
var COLUMNS = [
  'session_id',
  'timestamp',
  'completed',
  'residency',
  'street_name',
  'shaded_streets',
  'lagoon_health',
  'native_familiarity',
  'invasive_identify',
  'invasive_identify_other',
  'native_attributes',
  'native_attributes_other',
  'native_use',
  'barriers',
  'barriers_followup',
  'barriers_other',
  'ordinance_support',
  'learn_more',
  'contact_name',
  'contact_email',
  'contact_phone',
  'comments'
];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getOrCreateSheet();
    var sessionId = data.session_id || '';

    // Find existing row for this session (upsert behavior)
    var existingRow = findRowBySession(sheet, sessionId);

    // Build row data
    var row = COLUMNS.map(function(col) {
      return data[col] !== undefined ? String(data[col]) : '';
    });

    if (existingRow > 0) {
      // Update existing row
      sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
    } else {
      // Append new row
      sheet.appendRow(row);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Also handle GET for testing
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    message: 'Melbourne Beach Survey endpoint is live.'
  })).setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet() {
  var files = DriveApp.getFilesByName(SHEET_NAME);
  var ss;

  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
  } else {
    ss = SpreadsheetApp.create(SHEET_NAME);
    var sheet = ss.getActiveSheet();
    // Write headers
    var headers = COLUMNS.map(function(col) {
      return col.replace(/_/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
    });
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return ss.getActiveSheet();
}

function findRowBySession(sheet, sessionId) {
  if (!sessionId) return -1;
  var data = sheet.getDataRange().getValues();
  var sessionCol = COLUMNS.indexOf('session_id');

  for (var i = 1; i < data.length; i++) {
    if (data[i][sessionCol] === sessionId) {
      return i + 1; // 1-indexed
    }
  }
  return -1;
}
