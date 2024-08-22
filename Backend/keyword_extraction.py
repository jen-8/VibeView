import spacy
from collections import Counter
import instructor
from pydantic import BaseModel, Field
from openai import OpenAI
import os
from dotenv import load_dotenv
import openai
import pandas as pd

load_dotenv()
api_key = os.getenv('OPENAI_API_KEY')
openai.api_key = api_key

def _generate_system_prompt():
    return (
        "As an assistant tasked with analyzing customer comments, identify the primary and secondary topics or hashtags in the text. "
        "If hashtags are present, remove the '#' symbol and add spaces between the words. "
        "Assess the customer's emotion based on their comments using the following emotions: "
        "disappointment, sadness, neutral, joy, anger, disgust, confusion, love, excitement, surprise. "
        "Convert all text to lowercase for uniformity.\n\n"
        "Structure your response in the following format: "
        "{'keyword1': 'main_topic', 'keyword2': 'secondary_topic', 'emotion': 'detected_emotion'}\n\n"
        "If no topic is detected, use an empty string ('') for 'keyword1' and 'keyword2'."
    )

class Info(BaseModel):
    keyword1: str = Field(default="", description="The most relevant topic or hashtag of the comment. Use an empty string if no topic is detected.")
    keyword2: str = Field(default="", description="The secondary topic or hashtag of the comment. Use an empty string if no topic is detected.")
    emotion: str = Field(..., description="The customer's emotion as inferred from the comment.")


context_prompt = _generate_system_prompt()

client = instructor.from_openai(OpenAI())

def keyword_extraction(comment):
    try:
        if(pd.notna(comment)):
            user_info = client.chat.completions.create(
                model="gpt-4o",
                response_model=Info,
                messages=[
                    {
                        "role": "system",
                        "content": context_prompt,
                    },
                    {
                        "role": "user",
                        "content": comment,
                    }
                ],
                max_retries=3,
            )
            if isinstance(user_info, Info):
                return [user_info.keyword1.lower(), user_info.keyword2.lower()], user_info.emotion.lower()
        return ("", "")
    except Exception as e:
        print(f"Error happen {e}, text: {comment}")
        return ("safety filter", "safety filter")