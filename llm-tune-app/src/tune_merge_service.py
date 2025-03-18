import torch
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer

lora_adapters_path = "/root/models/deepseek-r1-invoices-finetuned/lora-adapters"
base_model_name = "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B"

base_model = AutoModelForCausalLM.from_pretrained(
    base_model_name,
    torch_dtype=torch.bfloat16,
)
tokenizer = AutoTokenizer.from_pretrained(base_model_name)

# Load LoRA model
model = PeftModel.from_pretrained(base_model, lora_adapters_path)

# Merge LoRA and base model
merged_model = model.merge_and_unload()

# Save merged model
merged_model.save_pretrained("/root/models/deepseek-r1-invoices-finetuned/merged", safe_serialization=True)
tokenizer.save_pretrained("/root/models/deepseek-r1-invoices-finetuned/merged")

print("Save location: /root/models/deepseek-r1-invoices-finetuned/merged")