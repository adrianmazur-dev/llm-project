import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";
import { getLlama, LlamaChatSession, resolveModelFile } from "node-llama-cpp";


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelsDirectory = path.join(__dirname, "..", "..", "models");


export class LlmService {
  private session: LlamaChatSession | null = null;
  private llama: any = null;

  async initialize() {
    this.llama = await getLlama();

    console.log(chalk.yellow("Resolving model file..."));
    const modelPath = await resolveModelFile(
      "hf:bartowski/gemma-2-2b-it-GGUF:Q6_K_L",
      modelsDirectory
    );

    console.log(chalk.yellow("Loading model..."));
    const model = await this.llama.loadModel({ modelPath });

    console.log(chalk.yellow("Creating context..."));
    const context = await model.createContext();

    this.session = new LlamaChatSession({
      contextSequence: context.getSequence(),
    });

    console.log(chalk.green("Model initialized"));
    return this.llama;
  }

  isInitialized(): boolean {
    return !!this.session && !!this.llama;
  }

  async chat(message: string): Promise<string> {
    if (!this.session) {
      throw new Error("Model not initialized");
    }
    
    console.log(chalk.yellow("User: ") + message);
    const response = await this.session.prompt(message);
    console.log(chalk.yellow("AI: ") + response);
    
    return response;
  }

  async structuredResponse(message: string, schema: any): Promise<{ rawResponse: string, structuredResponse: any }> {
    if (!this.session || !this.llama) {
      throw new Error("Model not initialized");
    }

    console.log(chalk.yellow("Structured request: ") + message);
    console.log(chalk.blue("Using schema: ") + JSON.stringify(schema, null, 2));
    
    const responseGrammar = await this.llama.createGrammarForJsonSchema(schema);
    const response = await this.session.prompt(message, { grammar: responseGrammar });
    const parsedResponse = responseGrammar.parse(response);
    
    console.log(chalk.yellow("Structured AI response: ") + JSON.stringify(parsedResponse, null, 2));
    
    return {
      rawResponse: response,
      structuredResponse: parsedResponse
    };
  }
}

export const llmService = new LlmService();
