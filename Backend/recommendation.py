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
        """
        You have been assigned the role of a language model tasked with generating a sample post, adhering strictly to the provided topic guidelines. 
        Your objective is to create a post that encapsulates prevalent themes, questions, or sentiments prevalent within the associated topic's community. 
        Ensure that your post is clear, succinct, and suitable for a diverse audience.
        Additionally, your response should offer strategic recommendations for further engaging with the topic or enhancing participation in community dialogues.
        Your response should look like this: 
        {'samplePost': str,'recommendation': str}
        """
    )

class Info(BaseModel):
    samplePost: str = Field(..., description="The sample post generated based on the provided topic, reflecting discussions, sentiments, or questions commonly associated with the topic.")
    recommendation: str = Field(..., description="Recommendations on how to further engage with the topic or community discussions.")

context_prompt = _generate_system_prompt()

client = instructor.from_openai(OpenAI())

def recommendation(topics_list):
    try:
        positive_topic = topics_list[0].get("topic")
        negative_topic = topics_list[-1].get("topic")
        # if(pd.notna(topic)):
        #     user_info = client.chat.completions.create(
        #         model="gpt-4o-mini",
        #         response_model=Info,
        #         messages=[
        #             {
        #                 "role": "system",
        #                 "content": context_prompt,
        #             },
        #             {
        #                 "role": "user",
        #                 "content": topic,
        #             }
        #         ],
        #         max_retries=3,
        #     )
        #     if isinstance(user_info, Info):
        #         # return [{'SamplePost': user_info.samplePost}, {'Recommendation': user_info.recommendation}]
        #         return [{'Recommendation': user_info.recommendation}]
        # return {}
        return [{'Positive Recommendation': f"Posts about \"{positive_topic}\" are doing well! Consider making more!"}, {'Negative Recommendation' : f"Posts about \"{negative_topic}\" are not well received."}] 
    except Exception as e:
        print(f"Error happen {e}")
        return {}
