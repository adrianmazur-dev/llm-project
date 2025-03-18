import { PDFExtract } from 'pdf.js-extract';
import { createWorker } from 'tesseract.js';

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
    const pdfExtract = new PDFExtract();
    const data = await pdfExtract.extractBuffer(pdfBuffer);
    return data.pages.map(page => page.content.map(item => item.str).join(' ')).join('\n');
}

export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    const worker = await createWorker('eng+pol'); // english, polish langs
    const { data: { text } } = await worker.recognize(imageBuffer);
    await worker.terminate();
    return text;
}

export async function extractTextFromBase64(base64String: string): Promise<string> {
    // rm base64 prefix
    const cleanedBase64 = base64String.replace(/^data:.*;base64,/, '');
    
    const fileBuffer = Buffer.from(cleanedBase64, 'base64');
    
    if (isPDF(base64String)) {
        return extractTextFromPDF(fileBuffer);
    } else {
        return extractTextFromImage(fileBuffer);
    }
}

function isPDF(base64String: string): boolean {
    return base64String.toLowerCase().includes('application/pdf') || 
           base64String.startsWith('JVBER');
}