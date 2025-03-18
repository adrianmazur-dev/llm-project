import { extractTextFromBase64 } from './text-extraction-service';
import { InvoiceData } from '../interfaces/InvoiceData';
import { llmService } from './llm-service';
import { generateInvoiceDataSchema } from '../utils/schema-generator';

export async function extractInvoiceDataFromBase64(base64File: string): Promise<InvoiceData> {
  const extractedText = await extractTextFromBase64(base64File);
  
  const prompt = `Extract invoice data from this text in JSON format. 
Follow this rules:
1. Use ISO dates (YYYY-MM-DD)
2. For Polish NIP numbers: verify 10-digit format
3. For missing fields: use null and add error description
4. For uncertain fields: add error description
5. Enter confidence level in scale from 0.0 to 1.0
6. Enter valid numbers
Return ONLY valid JSON

Extracted text from document:
${extractedText}`;

  const { structuredResponse } = await llmService.structuredResponse(prompt, generateInvoiceDataSchema());
  return structuredResponse as InvoiceData;
}
