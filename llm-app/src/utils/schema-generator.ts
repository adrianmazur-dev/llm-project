/**
 * JSON schema for InvoiceItem
 */
export function generateInvoiceItemSchema(): any {
  return {
    type: 'object',
    properties: {
      name: { type: ['string', 'null'] },
      unit: { type: ['string', 'null'] },
      quantity: { type: ['number', 'null'] },
      netUnitPrice: { type: ['number', 'null'] },
      vatRate: { type: ['number', 'null'] },
      netValue: { type: ['number', 'null'] },
      vatValue: { type: ['number', 'null'] },
      grossValue: { type: ['number', 'null'] },
    },
    required: []
  };
}

/**
 * JSON schema for InvoiceData
 */
export function generateInvoiceDataSchema(): any {
  return {
    type: 'object',
    properties: {
      invoiceNumber: { type: ['string', 'null'] },
      issueDate: { type: ['string', 'null'] },
      saleDate: { type: ['string', 'null'] },

      sellerName: { type: ['string', 'null'] },
      sellerAddress: { type: ['string', 'null'] },
      sellerVatId: { type: ['string', 'null'] },
      buyerName: { type: ['string', 'null'] },
      buyerAddress: { type: ['string', 'null'] },
      buyerVatId: { type: ['string', 'null'] },

      items: {
        type: 'array',
        items: generateInvoiceItemSchema()
      },

      currency: { type: ['string', 'null'] },
      totalAmountDue: { type: ['number', 'null'] },
      bankAccountNumber: { type: ['string', 'null'] },

      toPayAmount: { type: ['number', 'null'] },
      paidAmount: { type: ['number', 'null'] },
      paymentPaidDate: { type: ['string', 'null'] },
      paymentDeadline: { type: ['string', 'null'] },

      errors: {
        type: 'array',
        items: { type: 'string' }
      },
      confidence: { type: 'number' }
    },
    required: ['items']
  };
}
