from RoBERTa.src.roberta_model import SentimentModel
from transformers import RobertaTokenizer, RobertaModel
import yaml
import torch.nn as nn
import torch
import re
import os
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

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
    return text


def use_roberta(text):
    def load_config(config_path):
        with open(config_path, 'r') as file:
            config = yaml.safe_load(file)
        return config

    config = load_config('RoBERTa/config/config.yaml')
    sentiment_scores = []
    label = []
    label_list = ['negative', 'neutral', 'positive']
    # model = RobertaModel.from_pretrained(config['model']['local_path'])
    # tokenizer = RobertaTokenizer.from_pretrained(config['model']['local_path'])
    # input = [clean_text(text)]

    # token = tokenizer.batch_encode_plus(
    #     input,
    #     max_length=512,
    #     padding=True,
    #     truncation=True,
    #     return_tensors='pt'
    # )
    
    # model.eval()

    # classifier = nn.Linear(model.config.hidden_size, 3)

    # with torch.no_grad():
    #     outputs = model(**token)
    #     pooler_output = outputs.pooler_output

    #     logits = classifier(pooler_output)
    #     probabilities = nn.functional.softmax(logits, dim=1) 
    #     max_probs, max_indices = torch.max(probabilities, dim=1)
    # label_list = ['negative', 'neutral', 'positive']
    # # return max_probs, label_list[max_indices]
    # return probabilities

    local_model_dir = config['model']['local_path']
    os.makedirs(local_model_dir, exist_ok=True)
    tokenizer_dir = os.path.join(local_model_dir, "tokenizer")
    model_dir = os.path.join(local_model_dir, "model")
    config_dir = os.path.join(local_model_dir, "config")

    nltk.download('vader_lexicon', quiet=True)
    sia = SentimentIntensityAnalyzer()
    for t in text:
        result = sia.polarity_scores(t)['compound']
        sentiment_scores.append(result)
        if (result > -0.05 and result < 0.05):
            label.append(label_list[1])
        elif(result >= 0.05):
            label.append(label_list[2])
        else:
            label.append(label_list[0])

    # tokenizer = RobertaTokenizer.from_pretrained(local_model_dir)
    # model = SentimentModel(config['model']['name'], 
    #                    dropout_rate=config['model']['drop_out'], 
    #                    hidden_size=config['model']['hidden_size'], 
    #                    num_layers = config['model']['num_layers'])
    # PATH = f'{local_model_dir}/{config["model"]["local_model_name"]}'
    # model.load_state_dict(torch.load(PATH, map_location=torch.device('cpu')))

    # input = text

    # token = tokenizer.batch_encode_plus(
    #     input,
    #     max_length=512,
    #     padding=True,
    #     truncation=True,
    #     return_tensors='pt'
    # )
    
    # model.eval()

    # with torch.no_grad():
    #     outputs = model(**token)
    #     probabilities = outputs[1]
    #     max_probs, max_indice = torch.max(probabilities, dim=1)
    
    return label, sentiment_scores
