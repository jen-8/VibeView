from nitter import Nitter
import json
import database
from using_roberta import use_roberta
import random
from keyword_extraction import keyword_extraction
import datetime
from firebase_admin import firestore
import pytz

db = database.db_client

# instances=["https://nitter.tiekoetter.com", "https://bird.habedieeh.re", "https://nitter.lucabased.xyz", "https://nitter.privacydev.net", "https://nitter.kavin.rocks", "https://nitter.lunar.icu"],
scraper = Nitter( log_level = 1,skip_instance_check=False)

def scrape_twitter(profile, num, time_zone='America/New_York'):
    posts = scraper.get_tweets(profile, mode="user", number=num)
    for post in posts['tweets']:
        post['dateIngested'] = datetime.datetime.now(pytz.timezone(time_zone)).strftime('%Y-%m-%d')
        post['comments'] = []
        url = post['link'][19:]  # Get link and remove https://twitter.com
        if post['stats']['comments'] > 0:
            replies = scraper.get_replies(endpoint=url, term=f"replies for {url}", number=10)
            post['comments'] = replies['threads']
        
        original_date_str = post['date'].split("·")[0].strip()
        # Convert date string to datetime object in UTC, then convert to Eastern Time
        utc_date = datetime.datetime.strptime(original_date_str, '%b %d, %Y').replace(tzinfo=pytz.utc)
        eastern_time = utc_date.astimezone(pytz.timezone(time_zone))
        # Format the date to remove UTC and display in Eastern Time
        post['date'] = eastern_time.strftime('%Y-%m-%d %H:%M')  # Modified format to include time if neededW
        db.collection("twitter").document("accounts").collection(profile).document(url.split("/")[-1][:-2]).set(post)

        # print(post)
    # posts_json = json.dumps(posts, indent=4)

    # with open("twitter_posts.json", "w") as file:
    #     file.write(posts_json)

    if len(posts['tweets']) > 0:
        # if ingestion was successful, return true
        return True
    else:
        return False


def run_keyword_extraction(profile):
    posts_collection = db.collection("twitter").document("accounts").collection(profile)
    posts = posts_collection.stream()
    for post in posts:
        post_dict = post.to_dict()

        post_dict["keywords"], post_dict["emotion"] = keyword_extraction(post_dict["text"])
        
        posts_collection.document(post.id).set(post_dict)
        # print(post_dict["keywords"])
    


def calculate_sentiment(comment):
    label, score = use_roberta([comment['text']])
    return score[0]

def run_sentiment_analysis(profile):
    posts_collection = db.collection("twitter").document("accounts").collection(profile)
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
        # print(post_dict["link"] + ": " + str(sentiment))
    print("yee")

# updates the list of likes in the general info (for overview likes chart)
def update_general(account):
    collection_ref = db.collection("general").document("combined")
    doc = collection_ref.get()

    twitter_stats_ref = db.collection("general").document("twitter")
    twitter_stats = twitter_stats_ref.get()

    today_date = datetime.datetime.today().strftime('%Y-%m-%d')

    # recent_post = ""

    if doc.exists:
        doc_dict = doc.to_dict()
        old_list = doc_dict["data_list"]
        last_entry = old_list[-1]
        # if the last entry is from today, just add the twitter stats to the dict
        if ("date" in last_entry) and (today_date == last_entry["date"]):
            if twitter_stats.exists:
                stats_dict = twitter_stats.to_dict()
                last_entry["twitterNumLikes"] = stats_dict["Total Likes"]
                last_entry["twitter_account"] = str(account)
                # recent_post = stats_dict["mostRecent"]
        # if the last entry isnt from today, make a new entry and append it to the list
        else:
            entry = {}
            entry["date"] = today_date
            if twitter_stats.exists:
                stats_dict = twitter_stats.to_dict()
                entry["twitterNumLikes"] = stats_dict["Total Likes"]
                entry["twitter_account"] = str(account)
                # recent_post = stats_dict["mostRecent"]
            old_list.append(entry)

        # doc_dict["twitter_recent"] = recent_post
        # db.collection("general").document("combined").set(doc_dict)

    else:
        new_list = []
        entry = {}
        entry["date"] = today_date
        if twitter_stats.exists:
            stats_dict = twitter_stats.to_dict()
            entry["twitterNumLikes"] = stats_dict["Total Likes"]
            entry["twitter_account"] = str(account)
            # recent_post = stats_dict["mostRecent"]
        new_list.append(entry)
        # db.collection("general").document("combined").set({"data_list": new_list})
        # print(new_list)

# gets data for sentiment/num posts chart for overview
def get_sentiment_chart_by_date(profile):
    posts_collection = db.collection("twitter").document("accounts").collection(profile)
    # today_date = datetime.datetime.today().strftime('%Y-%m-%d')
    query = posts_collection.order_by("dateIngested", direction=firestore.Query.DESCENDING)
    # query = posts_collection.where(filter=FieldFilter("dateIngested", "==", today_date))
    recent_ingested = query.get()

    numPosts_query = posts_collection.count()
    numPosts = numPosts_query.get()

    if len(recent_ingested) == 0:
        return {}

    # to get the general twitter data
    twitter_ref = db.collection("general").document("twitter")
    twitter_doc = twitter_ref.get()

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

    twitter_dict = {}

    # if the general stats for twitter exists and the account names match, add this list to that dictionary. otherwise just return a dictionary with this list
    if twitter_doc.exists:
        twitter_dict = twitter_doc.to_dict()
        if twitter_dict.get("accountName") == profile:
            twitter_dict["recentIngestedDate"] = most_recent_date
            twitter_dict["recentIngestedList"] = recent_ingested_list
            twitter_dict["numPosts"] = numPosts[0][0].value
            
    # else:
    #     twitter_dict["recentIngestedList"] = recent_ingested_list

    # print(recent_ingested_list)
    return twitter_dict



# also gets general stats for the general database (ie most recent tweet)
def get_likes_retweets(profile):
    total_likes = 0
    total_retweets = 0
    data = {}
    posts_collection = db.collection("twitter").document("accounts").collection(profile)
    posts_list = posts_collection.get()
    posts = posts_collection.stream()
    sentimentSum = 0
    numPosts = 0
    numPositive = 0
    numNeutral = 0
    numNegative = 0 

    general_data = {}
    # print(posts_list)
    # most_recent = posts[-1].to_dict()

    for i, post in enumerate(posts):

        post_dict = post.to_dict()

        if i == len(posts_list) - 1:
            most_recent = post_dict

        total_likes += post_dict["stats"]["likes"]
        total_retweets += post_dict["stats"]["retweets"]
        sentimentSum += post_dict.get("sentiment", 0)
        numPosts += 1

        sentiment = post_dict.get("sentiment", -10)

        if sentiment != -10 and sentiment > 0.25:
            numPositive += 1
        elif sentiment != -10 and sentiment < -0.25:
            numNegative += 1
        elif sentiment != -10:
            numNeutral += 1
        # print(post.id)
        # print(post_dict["stats"]["likes"])

    if numPosts != 0:
        sentiment = sentimentSum/numPosts
    # print(sentiment)
        if sentiment > 0.25:
            data["General Sentiment"] = "Positive" 
        elif sentiment < -0.25:
            data["General Sentiment"] = "Negative" 
        else:
            data["General Sentiment"] = "Neutral" 

        # print(total_likes)
        data["Total Likes"] = total_likes
        data["Total Retweets"] = total_retweets

        general_data = data.copy()
        link = most_recent.get("link", "")
        if len(link) != 0:
            link = link[:-2]
        general_data["mostRecent"] = link
        general_data["mostRecentNumLikes"] = most_recent["stats"].get("likes", 0)
        general_data["mostRecentSentiment"] = format(most_recent.get("sentiment", 0), ".2f")
        general_data["mostRecentNumComments"] = most_recent["stats"].get("comments", 0)
        general_data["mostRecentDate"] = most_recent.get("date", "No date available")
        general_data["numPositive"] = numPositive
        general_data["numNeutral"] = numNeutral
        general_data["numNegative"] = numNegative
        general_data["accountName"] = profile

        db.collection("general").document("twitter").set(general_data)

        # update_general(profile)
    return data

def get_sentiment(element):
    return float(element["sentiment"])

def get_post_data(profile):
    posts_collection = db.collection("twitter").document("accounts").collection(profile)
    posts = posts_collection.stream()
    posts_list = []

    for post in posts:
        post_dict = post.to_dict()
        temp = {}
        temp["link"] = post_dict["link"]

        temp["sentiment"] = format(post_dict.get("sentiment", 0), ".2f")
        temp["tags"] = post_dict.get("keywords", []) 
        temp["emotion"] = post_dict.get("emotion", "")
        temp["comments"] = post_dict["comments"]
        temp["numComments"] = len(post_dict["comments"])
        temp["datePosted"] = post_dict.get("date", 0)
        posts_list.append(temp)
    
    posts_list.sort(key=get_sentiment, reverse=True)

    # print(posts_list)
    return posts_list

def get_chart_data(profile):
    posts_collection = db.collection("twitter").document("accounts").collection(profile)
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
        
        sentiment = round(post_dict.get("sentiment",0), 1)

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

def get_topic_data(profile):
    posts_collection = db.collection("twitter").document("accounts").collection(profile)
    posts = posts_collection.stream()
    # needs to be a list of dicts, each with keys keyword and sentiment
    # will need to store a count of each keyword and the sum
    topic_list = []

    # keys are keywords. values will be a list of [sentiment_sum, numPosts]
    topic_dict = {}

    for post in posts:
        post_dict = post.to_dict()

        # add stuff to topic_dict
        for keyword in post_dict["keywords"]:
            if keyword not in topic_dict.keys():
                topic_dict[keyword] = [post_dict.get("sentiment", 0), 1]
            else:
                # adds sentiment to the sum
                topic_dict[keyword][0] += post_dict.get("sentiment", 0)
                # adds 1 to number of posts for this keyword
                topic_dict[keyword][1] += 1

    for keyword in topic_dict.keys():
        temp = {}
        temp["keyword"] = keyword
        temp["sentiment"] = format(topic_dict[keyword][0]/topic_dict[keyword][1], ".2f")
        topic_list.append(temp)

    topic_list.sort(key=get_sentiment, reverse=True)

    # print(topic_list)
    return topic_list

def get_general_data():
    # collection_ref = db.collection("general").document("combined")
    twitter_ref = db.collection("general").document("twitter")
    youtube_ref = db.collection("general").document("youtube")
    linkedin_ref = db.collection("general").document("linkedin")
    # doc = collection_ref.get()
    twitter_doc = twitter_ref.get()
    youtube_doc = youtube_ref.get()
    linkedin_doc = linkedin_ref.get()

    return_list = []

    # # add the general document to the list
    # if doc.exists:
    #     return_list.append(doc.to_dict())
    # else:
    #     return_list.append({})
    
    # add twitter info
    if twitter_doc.exists:
        return_list.append(twitter_doc.to_dict())
    else:
        return_list.append({})

    # add youtube info
    if youtube_doc.exists:
        return_list.append(youtube_doc.to_dict())
    else:
        return_list.append({})

    # add linkedin info
    if linkedin_doc.exists:
        return_list.append(linkedin_doc.to_dict())
    else:
        return_list.append({})

    # print(return_list)
    return return_list


def collection_exists(profile):
    posts_collection = db.collection("twitter").document("accounts").collection(profile).get()
    if (len(posts_collection) > 0):
        return True
    else:
        return False
    