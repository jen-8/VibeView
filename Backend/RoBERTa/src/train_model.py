import torch
from matplotlib import pyplot as plt
import wandb
from tqdm import tqdm

def train_model(model, dataloader, criterion, optimizer, device, epochs, save_interval, enable_wandb):
    model.train()
    model.to(device)
    losses = []

    for epoch in range(epochs):
        for step, batch in tqdm(enumerate(dataloader)):
            batch = tuple(t.to(device) for t in batch)
            inputs = {'input_ids': batch[0], 'attention_mask': batch[1], 'labels': batch[2]}
            optimizer.zero_grad()
            outputs = model(**inputs)
            loss = outputs[0]
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            
            losses.append(loss.item())
            
            # Logging to Wandb
            if(enable_wandb):
                wandb.log({"batch_loss": loss.item()})

        torch.save(model.state_dict(), f'Backend/RoBERTa/models/model_epoch_{epoch}.pt')
        print(f'Saved model at epoch {epoch}')
        
        # Average loss for the epoch
        epoch_loss = sum(losses) / len(losses)
        if(enable_wandb):
            wandb.log({"epoch_loss": epoch_loss})

    # Plot loss using Matplotlib and log to Wandb
    plt.figure(figsize=(10, 5))
    plt.plot(losses, label='Training Loss')
    plt.title('Training Loss')
    plt.xlabel('Batch Number')
    plt.ylabel('Loss')
    plt.legend()
    plt.grid(True)
    plt.savefig('Backend/RoBERTa/outputs/loss_plot.png')
    plt.close()

    return model
