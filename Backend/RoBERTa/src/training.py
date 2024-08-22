import wandb
from torch.utils.data import DataLoader, TensorDataset, RandomSampler, SequentialSampler
import torch
import yaml
from train_model import train_model
from transformers import RobertaTokenizer, RobertaModel
import torch.optim as optim
import torch.nn as nn
from roberta_model import SentimentModel
from dotenv import load_dotenv
import os
import re
import pandas as pd
from sklearn.model_selection import train_test_split

# Clean data
def clean_text(text):
    # Remove HTML
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r'\\n+', ' ', text)
    text = re.sub(r'[^\w\s.,!?]', '', text)
    # Removal of numbers
    text = re.sub('[0-9]*[+-:]*[0-9]+', '', text)
    text = re.sub(r'\s+', ' ', text).strip()

    # Lowercase
    return text.lower()

# Processing
def prepare_data(df):
    tokens = tokenizer.batch_encode_plus(
        df['clean_text'].tolist(),
        max_length=512,
        padding=True,
        truncation=True,
        return_tensors='pt'
    )

    # Change [-1,0,1] to [0,1,2]
    dataset = TensorDataset(
        tokens['input_ids'],
        tokens['attention_mask'],
        torch.tensor(df['category'].values + 1)
    )

    return dataset

# Loading config from yaml
def load_config(config_path):
        with open(config_path, 'r') as file:
            config = yaml.safe_load(file)
        return config

config = load_config('Backend/RoBERTa/config/config.yaml')

# Initialize Wandb
if(bool(config["training"]["enable_wandb"])):
    WANDB_API_KEY=os.getenv('WANDB_API_KEY')
    wandb.init(
        project="coop2024Spring",
        # track hyperparameters and run metadata
        config=config
    )
    
local_model_dir = config['model']['local_path']
os.makedirs(local_model_dir, exist_ok=True)
tokenizer_dir = os.path.join(local_model_dir, "tokenizer")
model_dir = os.path.join(local_model_dir, "model")
config_dir = os.path.join(local_model_dir, "config")

# Download and save model locally
if not config['model']['local']:
    model_name = config['model']['name']
    tokenizer = RobertaTokenizer.from_pretrained(model_name)
    tokenizer.save_pretrained(local_model_dir)
    model = SentimentModel(model_name, 
                       dropout_rate=config['model']['drop_out'], 
                       hidden_size=config['model']['hidden_size'], 
                       num_layers = config['model']['num_layers'])
    model.save_pretrained(model_dir)
    # config = RobertaConfig.from_pretrained(model_name)
    # config.save_pretrained(config_dir)
    
# Initialize model
tokenizer = RobertaTokenizer.from_pretrained(tokenizer_dir)
model = RobertaModel.from_pretrained(model_dir)
# config = RobertaConfig.from_pretrained(config_dir)

df = pd.read_csv(config['data']['train_path'])
print("clean dataset")
df['clean_text'] = df['clean_text'].astype(str).apply(clean_text)

train_df, val_df = train_test_split(df, test_size=0.1)
train_df['clean_text'] = train_df['clean_text'].apply(clean_text)

success = False
while not success:
    try:
        tokenizer = RobertaTokenizer.from_pretrained(config['model']['name'])
        success = True
    except Exception as e:
        print(e)
print("get token")

train_dataset = prepare_data(train_df)
val_dataset = prepare_data(val_df)
print(train_df)
print("-----")
print(train_dataset[:10])
# DataLoader
train_dataloader = DataLoader(train_dataset, sampler=RandomSampler(train_dataset), batch_size=config['training']['batch_size'])
validation_dataloader = DataLoader(val_dataset, sampler=SequentialSampler(val_dataset), batch_size=config['training']['batch_size'])
print("done")

# Loss function and optimizer
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), 
                       lr=float(config["training"]["learning_rate"]),  
                       eps=float(config["training"]['eps']), 
                       weight_decay=float(config["training"]['weight_decay']))

device = torch.device(config["environment"]["device"] if torch.cuda.is_available() else "cpu")
train_model(model=model,
            dataloader=train_dataloader,
            criterion=criterion,
            optimizer=optimizer,
            device=device,
            epochs=int(config["training"]["epochs"]),
            save_interval=int(config["training"]["save_interval"]),
            enable_wandb=bool(config["training"]['enable_wandb']))


# os.system("shutdown now")