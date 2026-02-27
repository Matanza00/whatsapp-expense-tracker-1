const { google } = require("googleapis");
const credentials = require("./service-account.json");

async function test() {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: "13mnOMy6V8edv-qpaDZ0qNTkaOXY7Ioch8lDcQjBmFvk",
    range: "Transactions!A:G",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[new Date().toISOString(), "Expense", 100, "Test", "Test entry", "2026-02"]],
    },
  });

  console.log("Row added!");
}

test();