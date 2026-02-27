const { google } = require("googleapis");
const credentials = require("../service-account.json");

const SPREADSHEET_ID = "13mnOMy6V8edv-qpaDZ0qNTkaOXY7Ioch8lDcQjBmFvk";

async function appendToSheet(data) {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const now = new Date();

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Transactions!A:I",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          now,
          data.type,
          data.category,
          data.title,
          data.amount,
          "", // Week formula auto in sheet
          "", // Month
          "", // Year
          "", // Month-Year
        ],
      ],
    },
  });
}

module.exports = appendToSheet;