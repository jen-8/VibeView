from linkedin_api.linkedin import Linkedin
import json
import database
from dotenv import load_dotenv
import os
import re
from using_roberta import use_roberta
from keyword_extraction import keyword_extraction
import datetime
# import browser_cookie3
# import requests
from firebase_admin import firestore

load_dotenv()

# username = os.getenv('LINKEDIN_USERNAME')
# password = os.getenv('LINKEDIN_PASSWORD')

username = "dzhao@connexservice.ca"
password = "HHUN@an/-uz%S6z"
 
db = database.db_client

# Authenticate using any Linkedin account credentials
api = Linkedin(username, password, debug=True)

def scrape_linkedin(profile, num):
    # GET a profile
    posts = api.get_company_updates(public_id=profile, max_results=num)

    filteredPosts = []
    current_date = datetime.datetime.now()
    today_date = datetime.datetime.today().strftime('%Y-%m-%d')

    for post in posts:
        timeEstimate = post["value"]["com.linkedin.voyager.feed.render.UpdateV2"]["actor"]["subDescription"]["text"]
        match = re.search(r"(\d+)(mo|w|d|h|m|s)", timeEstimate)
        if match:
            num = int(match.group(1))
            unit = match.group(2)

            if unit == 'mo':
                month = current_date.month - num % 12
                year = current_date.year - (num // 12 + (1 if month <= 0 else 0))
                month = month if month > 0 else 12 + month
                day = min(current_date.day, [31, 29 if year % 4 == 0 and not year % 100 == 0 or year % 400 == 0 else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month-1])
                target_date = current_date.replace(year=year, month=month, day=day)
            elif unit == 'w':
                target_date = current_date - datetime.timedelta(weeks=num)
            elif unit == 'd':
                target_date = current_date - datetime.timedelta(days=num)
            else:
                target_date = current_date

            formatted_date = target_date.strftime('%Y-%m-%d')
        else:
            formatted_date = datetime.datetime.now().strftime('%Y-%m-%d')
        filteredPost = {}
        filteredPost["urn"] = post["urn"][16:]
        filteredPost["permalink"] = post["permalink"]
        filteredPost["postUrl"] = post["value"]["com.linkedin.voyager.feed.render.UpdateV2"]["updateMetadata"]["updateActions"]["actions"][1]["url"]
        filteredPost["timeEstimate"] = formatted_date
        filteredPost["text"] = post["value"]["com.linkedin.voyager.feed.render.UpdateV2"]["commentary"]["text"]["text"]
        filteredPost["reactionTypeCounts"] = post["value"]["com.linkedin.voyager.feed.render.UpdateV2"]["socialDetail"]["totalSocialActivityCounts"]["reactionTypeCounts"]
        filteredPost["numShares"] = post["value"]["com.linkedin.voyager.feed.render.UpdateV2"]["socialDetail"]["totalSocialActivityCounts"]["numShares"]
        filteredPost["numLikes"] = post["value"]["com.linkedin.voyager.feed.render.UpdateV2"]["socialDetail"]["totalSocialActivityCounts"]["numLikes"]
        filteredPost["numComments"] = post["value"]["com.linkedin.voyager.feed.render.UpdateV2"]["socialDetail"]["totalSocialActivityCounts"]["numComments"]
        filteredPost["comments"] = []
        filteredPost["dateIngested"] = today_date
        
        if filteredPost["numComments"] > 0:
            comments = api.get_post_comments(filteredPost["urn"], comment_count=10)
            for comment in comments:
                filteredComment = {}
                filteredComment["permalink"] = comment["permalink"]
                # filteredComment["commenter"] = comment["commenter"]["com.linkedin.voyager.feed.MemberActor"]["miniProfile"]["publicIdentifier"]
                filteredComment["numLikes"] = comment["socialDetail"]["totalSocialActivityCounts"]["numLikes"]
                filteredComment["text"] = comment["commentV2"]["text"]
                filteredPost["comments"].append(filteredComment)

        filteredPosts.append(filteredPost)
        db.collection("linkedin").document("accounts").collection(profile).document(filteredPost["urn"]).set(filteredPost)


    jsonstr = json.dumps(posts, indent=4)
    with open("linkedin.json", "w") as file:
        file.write(jsonstr)
    print("done")

def calculate_sentiment(comment):
    label, score = use_roberta([comment['text']])
    return score[0]

def run_sentiment_analysis(profile):
    posts_collection = db.collection("linkedin").document("accounts").collection(profile)
    posts = posts_collection.stream()
    for post in posts:
        post_dict = post.to_dict()
        sentiment_total = 0
        for comment in post_dict["comments"]:
            cur_comment_sent = calculate_sentiment(comment)
            comment["sentiment"] = cur_comment_sent
            sentiment_total += cur_comment_sent
        num_comments = len(post_dict["comments"])
        sentiment = 0 if num_comments == 0 else sentiment_total / num_comments
        post_dict["sentiment"] = sentiment # Change to sentiment score value
        posts_collection.document(post.id).set(post_dict)
        # print(post_dict["permalink"] + ": " + str(sentiment))
    print("yee")


def run_keyword_extraction(profile):
    posts_collection = db.collection("linkedin").document("accounts").collection(profile)
    posts = posts_collection.stream()
    for post in posts:
        post_dict = post.to_dict()

        post_dict["keywords"], post_dict["emotion"] = keyword_extraction(post_dict["text"])
        
        posts_collection.document(post.id).set(post_dict)
        # print(post_dict["keywords"])


# updates the list of likes in the general info (for overview likes chart)
def update_general(account):
    collection_ref = db.collection("general").document("combined")
    doc = collection_ref.get()

    linkedin_stats_ref = db.collection("general").document("linkedin")
    linkedin_stats = linkedin_stats_ref.get()

    today_date = datetime.datetime.today().strftime('%Y-%m-%d')

    # recent_post = ""

    if doc.exists:
        doc_dict = doc.to_dict()
        old_list = doc_dict["data_list"]
        last_entry = old_list[-1]
        # if the last entry is from today, append the linkedin stats on 
        if ("date" in last_entry) and (today_date == last_entry["date"]):
            if linkedin_stats.exists:
                stats_dict = linkedin_stats.to_dict()
                last_entry["linkedinNumLikes"] = stats_dict["Total Likes"]
                last_entry["linkedin_account"] = str(account)
                # recent_post = stats_dict["mostRecent"]
        # if the last entry isnt from today, make a new entry
        else:
            entry = {}
            entry["date"] = today_date
            if linkedin_stats.exists:
                stats_dict = linkedin_stats.to_dict()
                entry["linkedinNumLikes"] = stats_dict["Total Likes"]
                entry["linkedin_account"] = str(account)
                # recent_post = stats_dict["mostRecent"]
            old_list.append(entry)

        # doc_dict["linkedin_recent"] = recent_post

        # collection_ref.set(doc_dict)

    else:
        new_list = []
        entry = {}
        entry["date"] = today_date
        if linkedin_stats.exists:
            stats_dict = linkedin_stats.to_dict()
            entry["linkedinNumLikes"] = stats_dict["Total Likes"]
            entry["linkedin_account"] = str(account)

            # recent_post = stats_dict["mostRecent"]
        new_list.append(entry)
        # collection_ref.set({"data_list": new_list})

        # print(new_list)

# gets data for sentiment/num posts chart for overview
def get_sentiment_chart_by_date(profile):
    posts_collection = db.collection("linkedin").document("accounts").collection(profile)
    # today_date = datetime.datetime.today().strftime('%Y-%m-%d')
    query = posts_collection.order_by("dateIngested", direction=firestore.Query.DESCENDING)
    # query = posts_collection.where(filter=FieldFilter("dateIngested", "==", today_date))
    recent_ingested = query.get()

    numPosts_query = posts_collection.count()
    numPosts = numPosts_query.get()

    if len(recent_ingested) == 0:
        return {}

    # to get the general linkedin data
    linkedin_ref = db.collection("general").document("linkedin")
    linkedin_doc = linkedin_ref.get()

    data_dict = {}

    # initialize the sentiment keys in data_dict to have value of 0
    sent_count = -1.0
    for i in range(21):
        data_dict[round(sent_count, 1) if round(sent_count, 1) != 0.0 else 0.0] = 0
        sent_count += 0.1
        

    recent_ingested_list = []
    most_recent_date = ""

    for i, post in enumerate(recent_ingested):
        post_dict = post.to_dict()
        if i == 0:
            most_recent_date = post_dict.get("dateIngested")
        
        if post_dict.get("dateIngested") == most_recent_date:
            # recent_ingested_list.append(post_dict.get("dateIngested"))

            # add up the number of posts for each sentiment
            sentiment = round(post_dict.get("sentiment", 0), 1)

            if -1.0 <= sentiment <= 1.0:
                data_dict[sentiment] += 1

     # make each key-value pair its own dict to append to post_list
    for sentiment in data_dict.keys():
        temp = {}
        temp["sentiment"] = sentiment
        temp["numPosts"] = data_dict[sentiment]
        recent_ingested_list.append(temp)

    # if the general stats for linkedin exists and the account names match, add this list to that dictionary. otherwise just return a dictionary with this list
    if linkedin_doc.exists:
        linkedin_dict = linkedin_doc.to_dict()
        if linkedin_dict.get("accountName") == profile:
            linkedin_dict["recentIngestedDate"] = most_recent_date
            linkedin_dict["recentIngestedList"] = recent_ingested_list
            linkedin_dict["numPosts"] = numPosts[0][0].value
            
        # else:
        #     linkedin_dict["recentIngestedList"] = recent_ingested_list

    # print(recent_ingested_list)
    return linkedin_dict

def get_likes_shares(profile):
    total_likes = 0
    total_shares = 0
    data = {}
    posts_collection = db.collection("linkedin").document("accounts").collection(profile)
    posts_list = posts_collection.get()
    posts = posts_collection.stream()
    sentimentSum = 0
    numPosts = 0
    numPositive = 0
    numNeutral = 0
    numNegative = 0 

    general_data = {}

    for i, post in enumerate(posts):
        post_dict = post.to_dict()

        if i == len(posts_list) - 1:
            most_recent = post_dict
        
        total_likes += post_dict["numLikes"]
        total_shares += post_dict["numShares"]
        sentimentSum += post_dict.get("sentiment", 0) 
        numPosts += 1

        sentiment = post_dict.get("sentiment", -10)

        if sentiment != -10 and sentiment > 0.25:
            numPositive += 1
        elif sentiment != -10 and sentiment < -0.25:
            numNegative += 1
        elif sentiment != -10:
            numNeutral += 1

    sentiment = sentimentSum/numPosts
    # print(sentiment)
    if sentiment > 0.25:
        data["General Sentiment"] = "Positive" 
    elif sentiment < -0.25:
        data["General Sentiment"] = "Negative" 
    else:
        data["General Sentiment"] = "Neutral" 

    data["Total Likes"] = total_likes
    data["Total Shares"] = total_shares
    
    general_data = data.copy()
    general_data["mostRecent"] = most_recent.get("postUrl", "")
    general_data["mostRecentNumLikes"] = most_recent.get("numLikes", 0)
    general_data["mostRecentSentiment"] = format(most_recent.get("sentiment", 0), ".2f")
    general_data["mostRecentNumComments"] = most_recent.get("numComments", 0)
    general_data["mostRecentDate"] = most_recent.get("timeEstimate", "No date available")
    general_data["mostRecentText"] = most_recent.get("text", "")
    general_data["accountName"] = profile
    general_data["numPositive"] = numPositive
    general_data["numNeutral"] = numNeutral
    general_data["numNegative"] = numNegative

    db.collection("general").document("linkedin").set(general_data)

    # update_general(profile)

    # print(data)
    return data

def get_sentiment(element):
    return float(element["sentiment"])

def get_posts_data(profile):
    posts_collection = db.collection("linkedin").document("accounts").collection(profile)
    posts = posts_collection.stream()
    posts_list = []

    for post in posts:
        post_dict = post.to_dict()
        temp = {}
        temp["link"] = post_dict["permalink"]

        temp["sentiment"] = format(post_dict.get("sentiment", 0), ".2f")
        temp["tags"] = post_dict.get("keywords", []) 
        temp["emotion"] = post_dict.get("emotion", "")
        temp["comments"] = post_dict["comments"]
        temp["numComments"] = len(post_dict["comments"])
        temp["datePosted"] = post_dict.get("timeEstimate", "")
        posts_list.append(temp)
    
    posts_list.sort(key=get_sentiment, reverse=True)

    # print(posts_list)
    return posts_list

def get_chart_data(profile):
    posts_collection = db.collection("linkedin").document("accounts").collection(profile)
    posts = posts_collection.stream()
    # needs to be a list of dicts, each with keys sentiment and numPosts
    data_list = []
    # another list of dicts, keys are topic and sentiment. there will be a dict for each topic in the post
    topic_list = []

    # stores sentiment value as keys and number of posts as values. makes it easier to add up the numPosts
    data_dict = {}

    # initialize the sentiment keys in data_dict to have value of 0
    sent_count = -1.0
    for i in range(21):
        data_dict[round(sent_count, 1) if round(sent_count, 1) != 0.0 else 0.0] = 0
        sent_count += 0.1

    # add up the number of posts for each sentiment
    for post in posts:
        post_dict = post.to_dict()
        
        sentiment = round(post_dict.get("sentiment", 0), 1)

        if -1.0 <= sentiment <= 1.0:
            data_dict[sentiment] += 1

        # add dicts to topic_list
        for topic in post_dict.get("keywords", []):
            if topic is None or topic == "" or topic == "none":
                continue
            entry = {}
            entry["topic"] = topic
            entry["sentiment"] = sentiment
            topic_list.append(entry)


    # make each key-value pair its own dict to append to post_list
    for sentiment in data_dict.keys():
        temp = {}
        temp["sentiment"] = sentiment
        temp["numPosts"] = data_dict[sentiment]
        data_list.append(temp)

    topic_list.sort(key=get_sentiment, reverse=True)
    # print(topic_list)
    return [data_list, topic_list]


def collection_exists(profile):
    posts_collection = db.collection("linkedin").document("accounts").collection(profile).get()
    if (len(posts_collection) > 0):
        return True
    else:
        return False