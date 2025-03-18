import torch
from datasets import load_dataset
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, Trainer
from peft import LoraConfig, get_peft_model

print("Tune started...")

# Load Dataset
dataset_name = "mychen76/invoices-and-receipts_ocr_v1"
dataset = load_dataset(dataset_name)

# Load Pre-trained Model and Tokenizer
model_name = "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.bfloat16,
    device_map="auto"
)

# Tokenize the Dataset
def tokenize_function(examples):
    instruction_prefix = "[INST] "
    instruction_suffix = " [/INST] "
    response_prefix = ""
    response_suffix = "</s>"
    max_length = 512

    tokenized_examples = []
    for idx, (raw, prepared) in enumerate(zip(examples['raw_data'], examples['parsed_data'])):
        instruction_text = instruction_prefix + raw + instruction_suffix
        response_text = response_prefix + prepared + response_suffix
        full_text = instruction_text + response_text

        tokenizer.truncation_side = 'right'
        tokenized_example = tokenizer(full_text, truncation=True, max_length=max_length, return_attention_mask=True, return_tensors='np')
        input_ids = tokenized_example['input_ids'][0].tolist()

        tokenized_examples.append(tokenized_example)

    input_ids_list = [ex['input_ids'][0].tolist() for ex in tokenized_examples]
    attention_masks_list = [ex['attention_mask'][0].tolist() for ex in tokenized_examples]

    labels_list = []
    for idx, ex in enumerate(tokenized_examples):
        input_ids = input_ids_list[idx] # Use the list version
        response_text = response_prefix + examples['parsed_data'][idx] + response_suffix
        response_tokens = tokenizer.encode(response_text)
        label_ids = [-100] * (len(input_ids) - len(response_tokens)) + response_tokens

        if len(label_ids) > max_length:
            label_ids = label_ids[:max_length]

        labels_list.append(label_ids)

    padded_batch = tokenizer.pad(
        {'input_ids': input_ids_list, 'attention_mask': attention_masks_list, 'labels': labels_list},
        padding="max_length",
        max_length=max_length,
        return_attention_mask=True,
        return_tensors='pt'
    )

    return {
        "input_ids": padded_batch['input_ids'],
        "attention_mask": padded_batch['attention_mask'],
        "labels": padded_batch['labels']
    }

tokenized_datasets = dataset.map(tokenize_function, batched=True, batch_size=2)

# LoRA Configuration
lora_config = LoraConfig(
    r=8, # LoRA rank
    lora_alpha=32, # Learning rate scaling
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
    target_modules=["q_proj", "v_proj"]
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters() # trained parameters

# Training Arguments
training_args = TrainingArguments(
    output_dir="/root/models/deepseek-r1-invoices-finetuned", # Output directory for fine-tuned model
    num_train_epochs=1,      # number of epochs (pętle)
    per_device_train_batch_size=2, # GPU memory
    gradient_accumulation_steps=2, # GPU memory
    learning_rate=2e-4,
    weight_decay=0.01,
    logging_dir="/root/models/logs",
    logging_steps=10,
    save_strategy="epoch",    # Save model at the end of each epoch
    eval_strategy="epoch",
    save_total_limit=2,
    load_best_model_at_end=True # based on evaluation metric
)

# Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets['train'], # specified from dataset
    eval_dataset=tokenized_datasets['valid'] if 'valid' in tokenized_datasets else None, # specified from dataset
    tokenizer=tokenizer
)

trainer.train()
trainer.save_model("/root/models/deepseek-r1-invoices-finetuned/lora-adapters") # Save LoRA adapters

print("Tune finished")