import { google } from 'googleapis';

class GoogleSheetsService {
    constructor() {
        this.sheets = null;
        this.auth = null;
    }

    /**
     * Initialize Google Sheets API with Service Account
     */
    async initialize() {
        if (this.sheets) return this.sheets;

        // Service Account credentials from environment
        // Handle different formats of newlines in private key
        let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';

        // Remove surrounding quotes if present (Docker env issue)
        privateKey = privateKey.replace(/^["']|["']$/g, '');

        // Replace literal \n with actual newlines
        privateKey = privateKey.split('\\n').join('\n');

        const credentials = {
            type: 'service_account',
            project_id: process.env.GOOGLE_PROJECT_ID,
            private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
            private_key: privateKey,
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            client_id: process.env.GOOGLE_CLIENT_ID,
            auth_uri: 'https://accounts.google.com/o/oauth2/auth',
            token_uri: 'https://oauth2.googleapis.com/token',
        };

        this.auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        this.sheets = google.sheets({ version: 'v4', auth: this.auth });
        return this.sheets;
    }

    /**
     * Get data from a specific sheet
     * @param {string} spreadsheetId - The ID of the spreadsheet
     * @param {string} range - The range to read (e.g., 'Sheet1!A:E')
     * @returns {Promise<Array>} - Array of rows
     */
    async getSheetData(spreadsheetId, range) {
        await this.initialize();

        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId,
                range,
            });

            return response.data.values || [];
        } catch (error) {
            console.error('Error reading Google Sheet:', error.message);
            throw error;
        }
    }

    /**
     * Update a specific cell in the sheet
     * @param {string} spreadsheetId - The ID of the spreadsheet
     * @param {string} range - The cell range (e.g., 'Sheet1!A1')
     * @param {any} value - The value to write
     */
    async updateCell(spreadsheetId, range, value) {
        await this.initialize();

        try {
            await this.sheets.spreadsheets.values.update({
                spreadsheetId,
                range,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [[value]]
                }
            });
        } catch (error) {
            console.error('Error updating Google Sheet:', error.message);
            throw error;
        }
    }

    /**
     * Clear data in a specific range
     * @param {string} spreadsheetId - The ID of the spreadsheet
     * @param {string} range - The range to clear (e.g., 'Sheet1!B3:C14')
     */
    async clearRange(spreadsheetId, range) {
        await this.initialize();

        try {
            await this.sheets.spreadsheets.values.clear({
                spreadsheetId,
                range,
            });
        } catch (error) {
            console.error('Error clearing Google Sheet range:', error.message);
            throw error;
        }
    }

    /**
     * Find next empty row in a range and insert date and nominal
     * @param {string} sheetName - Sheet name (e.g., 'Google', 'VPS', 'Domain')
     * @param {string} date - Date string to insert
     * @param {string} nominal - Nominal value to insert
     * @returns {Promise<number>} - The row number where data was inserted
     */
    async addBillEntry(sheetName, date, nominal) {
        await this.initialize();
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        // Get existing data in B3:B14 to find next empty row
        const dateRange = `${sheetName}!B3:B14`;
        const existingData = await this.getSheetData(spreadsheetId, dateRange);

        // Find the next empty row (0-indexed in the array, but starts at row 3)
        let nextRow = 3; // Start from row 3
        if (existingData && existingData.length > 0) {
            // Find first empty cell
            for (let i = 0; i < 12; i++) { // B3:B14 = 12 rows
                if (!existingData[i] || !existingData[i][0] || existingData[i][0] === '') {
                    nextRow = 3 + i;
                    break;
                }
                if (i === 11) {
                    // All rows are filled
                    throw new Error('All billing rows (B3:B14) are full. Cannot add more entries.');
                }
            }
        }

        // Insert date in column B
        const dateCell = `${sheetName}!B${nextRow}`;
        await this.updateCell(spreadsheetId, dateCell, date);

        // Insert nominal in column C
        const nominalCell = `${sheetName}!C${nextRow}`;
        await this.updateCell(spreadsheetId, nominalCell, nominal);

        return nextRow;
    }

    /**
     * Add payment entry - insert date to specific column based on username
     * @param {string} sheetName - Sheet name (e.g., 'Google', 'VPS', 'Domain')
     * @param {string} date - Date string to insert
     * @param {string} column - Column letter (E or G)
     * @returns {Promise<number>} - The row number where data was inserted
     */
    async addPaymentEntry(sheetName, date, column) {
        await this.initialize();
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        // Get existing data in column 3:14 to find next empty row
        const dateRange = `${sheetName}!${column}3:${column}14`;
        const existingData = await this.getSheetData(spreadsheetId, dateRange);

        // Find the next empty row (0-indexed in the array, but starts at row 3)
        let nextRow = 3; // Start from row 3
        if (existingData && existingData.length > 0) {
            // Find first empty cell
            for (let i = 0; i < 12; i++) { // 3:14 = 12 rows
                if (!existingData[i] || !existingData[i][0] || existingData[i][0] === '') {
                    nextRow = 3 + i;
                    break;
                }
                if (i === 11) {
                    // All rows are filled
                    throw new Error(`All payment rows (${column}3:${column}14) are full. Cannot add more entries.`);
                }
            }
        }

        // Insert date in the column
        const dateCell = `${sheetName}!${column}${nextRow}`;
        await this.updateCell(spreadsheetId, dateCell, date);

        return nextRow;
    }

    /**
     * Get VPS subscription data
     * @returns {Promise<Array>}
     */
    async getVpsData() {
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        const range = process.env.GOOGLE_SHEET_VPS_RANGE || 'VPS!A:E';
        return this.getSheetData(spreadsheetId, range);
    }

    /**
     * Get Google Workspace subscription data
     * @returns {Promise<Array>}
     */
    async getGoogleData() {
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        const range = process.env.GOOGLE_SHEET_GOOGLE_RANGE || 'Google!A:E';
        return this.getSheetData(spreadsheetId, range);
    }

    /**
     * Get Domain subscription data
     * @returns {Promise<Array>}
     */
    async getDomainData() {
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        const range = process.env.GOOGLE_SHEET_DOMAIN_RANGE || 'Domain!A:E';
        return this.getSheetData(spreadsheetId, range);
    }
}

// Singleton instance
const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;
