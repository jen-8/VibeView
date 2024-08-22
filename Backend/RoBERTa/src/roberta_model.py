import torch
import torch.nn as nn
from transformers import RobertaModel, RobertaConfig
import torch.nn.functional as F
from timm.loss import LabelSmoothingCrossEntropy
import os
import json

# class SentimentModel(nn.Module):
#     def __init__(self, model_name, dropout_rate=0.5, hidden_size=1024, lstm_hidden_size=256, num_layers=2):
#         super(SentimentModel, self).__init__()
#         self.num_labels = 3
#         self.roberta = RobertaModel.from_pretrained(model_name)
#         for param in self.roberta.parameters():
#             param.requires_grad = True
#         self.lstm = nn.LSTM(hidden_size, lstm_hidden_size, num_layers, bidirectional=True, batch_first=True, dropout=dropout_rate)
#         self.tanh1 = nn.Tanh()
#         self.classifier = nn.Sequential(
#             nn.Linear(lstm_hidden_size*2, 128),
#             nn.ReLU(),
#             nn.Linear(128, self.num_labels))
#         self.attention = nn.Parameter(torch.zeros(lstm_hidden_size*2))

#     def forward(self, input_ids, attention_mask=None, labels=None):
#         outputs = self.roberta(input_ids=input_ids, attention_mask=attention_mask)
#         sequence_output = outputs[0]

#         lstm_output, (h_n, c_n) = self.lstm(sequence_output)
#         M = self.tanh1(lstm_output)
#         alpha = F.softmax(torch.matmul(M, self.attention), dim=1).unsqueeze(-1)
#         output = lstm_output * alpha
#         output = torch.sum(output, 1)
#         output = F.relu(output)
#         logits = self.classifier(output)

#         loss = None
#         if labels is not None:
#             labels = labels.long()
#             loss_fct = LabelSmoothingCrossEntropy()
#             loss = loss_fct(logits.view(-1, self.num_labels), labels.view(-1))

#         return loss, logits
    
#     def save_pretrained(self, save_directory):
#         if not os.path.exists(save_directory):
#             os.makedirs(save_directory)
#         model_path = os.path.join(save_directory, "pytorch_model.bin")
#         torch.save(self.state_dict(), model_path)
        
#         config_path = os.path.join(save_directory, "config.json")
#         with open(config_path, 'w') as f:
#             json.dump({
#                 'model_name': self.model_name,
#                 'dropout_rate': self.dropout_rate,
#                 'hidden_size': self.hidden_size,
#                 'lstm_hidden_size': self.lstm_hidden_size,
#                 'num_layers': self.num_layers
#             }, f)

#     @classmethod
#     def from_pretrained(cls, pretrained_directory):
#         config_path = os.path.join(pretrained_directory, "config.json")
#         with open(config_path, 'r') as f:
#             config = json.load(f)
#         model = cls(**config)
#         model_path = os.path.join(pretrained_directory, "pytorch_model.bin")
#         model.load_state_dict(torch.load(model_path))
#         return model
    
#     def predict(self, text):
#         # Encoding
#         encoded_input = self.tokenizer(text, return_tensors='pt')
        
#         # Predict
#         with torch.no_grad():
#             outputs = self.model(**encoded_input)
        
#         # Using Softmax to get probability
#         scores = torch.nn.functional.softmax(outputs.logits, dim=1)
#         labels = ['negative', 'neutral', 'positive']
        
#         results = {label: score.item() for label, score in zip(labels, scores.flatten())}
        
#         return results

class SentimentModel(nn.Module):
    def __init__(self, model_name, dropout_rate=0.5, hidden_size=1024, lstm_hidden_size=256, num_layers=2):
        super(SentimentModel, self).__init__()
        self.num_labels = 3
        self.roberta = RobertaModel.from_pretrained(model_name)
        for param in self.roberta.parameters():
            param.requires_grad = True
        self.classifier = nn.Linear(self.roberta.config.hidden_size, 3)

    def forward(self, input_ids, attention_mask=None, labels=None):
        outputs = self.roberta(input_ids=input_ids, attention_mask=attention_mask)
        sequence_output = outputs[0][:, 0]
        
        logits = self.classifier(sequence_output)

        loss = None
        if labels is not None:
            labels = labels.long()
            loss_fct = LabelSmoothingCrossEntropy()
            loss = loss_fct(logits.view(-1, self.num_labels), labels.view(-1))

        return loss, logits