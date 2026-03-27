/**
 * Supabase → Google Sheets Export
 *
 * SETUP:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Paste this entire file
 * 4. Replace SUPABASE_URL and SUPABASE_SERVICE_KEY below
 * 5. Run "importSurveyData" once manually to authorize
 * 6. Set up a trigger: Edit > Triggers > Add Trigger
 *    - Function: importSurveyData
 *    - Event source: Time-driven
 *    - Type: Minutes timer (every 15 min) or Hour timer
 *
 * The sheet will auto-refresh with all responses on schedule.
 */

var SUPABASE_URL = 'https://bvmyrgmdpxuizasrvsul.supabase.co';
var SUPABASE_SERVICE_KEY = 'YOUR_SERVICE_ROLE_KEY_HERE'; // Paste from .env

var COLUMNS = [
  { key: 'session_id', header: 'Session ID' },
  { key: 'created_at', header: 'Started At' },
  { key: 'updated_at', header: 'Last Updated' },
  { key: 'completed', header: 'Completed?' },
  { key: 'residency', header: 'Residency' },
  { key: 'street_name', header: 'Street Name' },
  { key: 'shaded_streets', header: 'Shaded Streets (1-5)' },
  { key: 'lagoon_health', header: 'Lagoon Health (1-5)' },
  { key: 'native_familiarity', header: 'Native Familiarity (1-5)' },
  { key: 'invasive_identify', header: 'Invasive Plants Identified' },
  { key: 'invasive_identify_other', header: 'Invasive - Other' },
  { key: 'native_attributes', header: 'Native Attributes' },
  { key: 'native_attributes_other', header: 'Attributes - Other' },
  { key: 'native_use', header: 'Uses Native Plants?' },
  { key: 'barriers', header: 'Barriers' },
  { key: 'barriers_followup', header: 'Look Dislike Detail' },
  { key: 'barriers_other', header: 'Barriers - Other' },
  { key: 'ordinance_support', header: 'Ordinance Support (1-5)' },
  { key: 'learn_more', header: 'Learn More' },
  { key: 'contact_name', header: 'Name' },
  { key: 'contact_email', header: 'Email' },
  { key: 'contact_phone', header: 'Phone' },
  { key: 'comments', header: 'Comments' }
];

function importSurveyData() {
  var response = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/survey_responses?order=created_at.asc', {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY
    }
  });

  var data = JSON.parse(response.getContentText());
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Clear and rewrite
  sheet.clear();

  // Headers
  var headers = COLUMNS.map(function(c) { return c.header; });
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);

  // Data rows
  if (data.length > 0) {
    var rows = data.map(function(row) {
      return COLUMNS.map(function(c) {
        var val = row[c.key];
        if (val === null || val === undefined) return '';
        if (c.key === 'completed') return val ? 'Yes' : 'No';
        if (c.key === 'created_at' || c.key === 'updated_at') {
          return new Date(val).toLocaleString();
        }
        return String(val);
      });
    });
    sheet.getRange(2, 1, rows.length, COLUMNS.length).setValues(rows);
  }

  // Auto-resize
  for (var i = 1; i <= COLUMNS.length; i++) {
    sheet.autoResizeColumn(i);
  }

  SpreadsheetApp.getActiveSpreadsheet().toast(
    data.length + ' responses imported',
    'Survey Import Complete'
  );
}
