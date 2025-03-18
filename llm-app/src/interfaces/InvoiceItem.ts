export interface InvoiceItem {
    name: string | null;
    unit: string | null;
    quantity: number | null;
    netUnitPrice: number | null;
    vatRate: number | null;
    netValue: number | null;
    vatValue: number | null;
    grossValue: number | null;
}
