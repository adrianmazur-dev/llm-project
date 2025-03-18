import { InvoiceItem } from "./InvoiceItem";


export interface InvoiceData {
    invoiceNumber?: string | null;
    issueDate?: string | null;
    saleDate?: string | null;

    sellerName?: string | null;
    sellerAddress?: string | null;
    sellerVatId?: string | null;

    buyerName?: string | null;
    buyerAddress?: string | null;
    buyerVatId?: string | null;

    items: InvoiceItem[];
    currency?: string | null;
    totalAmountDue?: number | null;
    bankAccountNumber?: string | null;
    
    toPayAmount?: number | null;
    paidAmount?: number | null;
    paymentPaidDate?: string | null;
    paymentDeadline?: string | null;

    
    errors?: string[];
    confidence?: number;
}
