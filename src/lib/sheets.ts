import { google } from "googleapis";

// Google Sheets API client
let sheetsClient: any = null;

function getSheetsClient() {
  if (sheetsClient) {
    return sheetsClient;
  }

  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!serviceAccountEmail || !privateKey || !sheetId) {
    console.warn("⚠️ Google Sheets credentials not configured. Sheets sync will be disabled.");
    return null;
  }

  try {
    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    sheetsClient = google.sheets({ version: "v4", auth });
    return sheetsClient;
  } catch (error) {
    console.error("❌ Error initializing Google Sheets client:", error);
    return null;
  }
}

// Append row to sheet
export async function appendToSheet(
  sheetId: string,
  range: string,
  values: any[][]
): Promise<boolean> {
  try {
    const client = getSheetsClient();
    if (!client) {
      console.warn("⚠️ Sheets client not available");
      return false;
    }

    await client.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: {
        values,
      },
    });

    console.log("✅ Row appended to sheet successfully");
    return true;
  } catch (error) {
    console.error("❌ Error appending to sheet:", error);
    return false;
  }
}

// Test connection to Google Sheets
export async function testSheetsConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId) {
      return {
        success: false,
        message: "GOOGLE_SHEET_ID not configured",
      };
    }

    const client = getSheetsClient();
    if (!client) {
      return {
        success: false,
        message: "Failed to initialize Google Sheets client. Check credentials.",
      };
    }

    // Try to read the first row to test connection
    const response = await client.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "A1:Z1",
    });

    return {
      success: true,
      message: "Connection successful",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Connection failed",
    };
  }
}

// Sync order to Google Sheets (called when billing marked as paid)
export async function syncOrderToSheets(data: {
  orderNumber: string;
  date: Date;
  customerName: string;
  customerPhone: string;
  courierName: string | null;
  liters: number;
  pricePerLiter: number;
  totalAmount: number;
}): Promise<boolean> {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId) {
      console.warn("⚠️ GOOGLE_SHEET_ID not configured");
      return false;
    }

    const client = getSheetsClient();
    if (!client) {
      console.warn("⚠️ Sheets client not available");
      return false;
    }

    // Format date as DD/MM/YYYY
    const dateStr = new Date(data.date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Prepare row data
    const row = [
      data.orderNumber, // A: Order Number
      dateStr, // B: Date
      data.customerName, // C: Customer Name
      data.customerPhone, // D: Customer Phone
      data.courierName || "Unassigned", // E: Courier Name
      data.liters.toString(), // F: Liters
      `Rp ${data.pricePerLiter.toLocaleString("id-ID")}`, // G: Price/Liter
      `Rp ${data.totalAmount.toLocaleString("id-ID")}`, // H: Total Amount
    ];

    // Append to sheet (Sheet1 by default, or specify range like "Sheet1!A:H")
    const range = "Sheet1!A:H";
    const success = await appendToSheet(sheetId, range, [row]);

    if (success) {
      console.log(`✅ Order ${data.orderNumber} synced to Google Sheets`);
    }

    return success;
  } catch (error) {
    console.error("❌ Error syncing order to sheets:", error);
    return false;
  }
}

// Get last sync time from database (optional - could store in a settings table)
// For now, we'll just log to console

