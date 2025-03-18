import path from "path";
import {fileURLToPath} from "url";
import chalk from "chalk";
import express from 'express';
import { llmService } from './services/llm-service';
import { extractInvoiceDataFromBase64 } from './services/invoice-extraction-service';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json({ limit: '50mb' }));

// Chat endpoint
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            res.status(400).json({ error: 'Message is required' });
            return;
        }
        
        if (!llmService.isInitialized()) {
            res.status(500).json({ error: 'Model not initialized yet' });
            return;
        }

        const response = await llmService.chat(message);
        res.json({ response });
    } catch (error) {
        console.error('Error processing chat request:', error);
        res.status(500).json({ error: 'Failed to process chat request' });
    }
});

// Structured JSON response endpoint
app.post('/structured', async (req, res) => {
    try {
        const { message, schema } = req.body;
        
        if (!message) {
            res.status(400).json({ error: 'Message is required' });
            return;
        }
        
        if (!schema) {
            res.status(400).json({ error: 'JSON schema is required' });
            return;
        }
        
        if (!llmService.isInitialized()) {
            res.status(500).json({ error: 'Model not initialized yet' });
            return;
        }

        try {
            const result = await llmService.structuredResponse(message, schema);
            res.json(result);
        } catch (grammarError) {
            console.error('Error with grammar or parsing:', grammarError);
            res.status(422).json({ 
                error: 'Failed to process with the provided schema',
                details: grammarError
            });
        }
    } catch (error) {
        console.error('Error processing structured request:', error);
        res.status(500).json({ error: 'Failed to process structured request' });
    }
});

// Invoice extraction endpoint
app.post('/extract-invoice', async (req, res) => {
    try {
        const { base64File } = req.body;
        
        if (!base64File) {
            res.status(400).json({ error: 'Base64 file data is required' });
            return;
        }
        
        if (!llmService.isInitialized()) {
            res.status(500).json({ error: 'Model not initialized yet' });
            return;
        }

        const invoiceData = await extractInvoiceDataFromBase64(base64File);
        res.json({ invoiceData });
    } catch (error) {
        console.error('Error processing invoice extraction request:', error);
        res.status(500).json({ error: 'Failed to extract invoice data' });
    }
});

// Start the server and initialize the model
(async () => {
    try {
        await llmService.initialize();
        
        app.listen(port, () => {
            console.log(chalk.green(`Running on http://localhost:${port}`));
            console.log(chalk.green('Endpoints:'));
            console.log(chalk.green('- POST /chat - simple chat'));
            console.log(chalk.green('- POST /structured - JSON schema for structured response'));
            console.log(chalk.green('- POST /extract-invoice - base64 encoded file to extract invoice data'));
        });
    } catch (error) {
        console.error('Failed to initialize the model:', error);
        process.exit(1);
    }
})();