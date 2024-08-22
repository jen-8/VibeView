import os
from googleapiclient.discovery import build
from dotenv import load_dotenv
import json
import database
from using_roberta import use_roberta
from keyword_extraction import keyword_extraction
import datetime
from firebase_admin import firestore

load_dotenv()

api_key = os.getenv('YOUTUBE_API_KEY')

db = database.db_client

youtube = build('youtube', 'v3', developerKey=api_key)

def get_video_details(video_id):
    video_response = youtube.videos().list(part='snippet,statistics',
                                           id=video_id).execute()
    video_details = video_response.get('items', [])[0]
    # print(video_details['snippet']['publishedAt'])
    return {
        'title': video_details['snippet']['title'],
        'likeCount': video_details['statistics'].get('likeCount', 0),
        'viewCount': video_details['statistics'].get('viewCount', 0),
        'commentCount': video_details['statistics'].get('commentCount', 0)
    }, datetime.datetime.fromisoformat(video_details['snippet']['publishedAt'].replace('Z', '+00:00')).strftime("%Y-%m-%d·%I:%M %p")
 

def get_comments(video_id):
    comments = []
    try:
        response = youtube.commentThreads().list(
            part='snippet,replies',
            videoId=video_id,
            maxResults=100,
            textFormat='plainText'
        ).execute()
       
        while response:
            for item in response['items']:
                comment_info = item['snippet']['topLevelComment']['snippet']
                comment_data = {
                    'author': comment_info['authorDisplayName'],
                    'comment': comment_info['textDisplay'],
                    'like': comment_info['likeCount'],
                    'publishedAt': datetime.datetime.fromisoformat(comment_info['publishedAt'].replace('Z', '+00:00')).strftime("%Y-%m-%d·%I:%M %p"),
                    'replies': []
                }
 
                if item['snippet']['totalReplyCount'] > 0 and 'replies' in item:
                    for reply in item['replies']['comments']:
                        reply_info = reply['snippet']
                        comment_data['replies'].append({
                            'author': reply_info['authorDisplayName'],
                            'comment': reply_info['textDisplay'],
                            'like': reply_info['likeCount'],
                            'publishedAt': datetime.datetime.fromisoformat(reply_info['publishedAt'].replace('Z', '+00:00')).strftime("%Y-%m-%d·%I:%M %p")
                        })
 
                comments.append(comment_data)
           
            if 'nextPageToken' in response:
                response = youtube.commentThreads().list(
                    part='snippet,replies',
                    videoId=video_id,
                    pageToken=response['nextPageToken'],
                    maxResults=100,
                    textFormat='plainText'
                ).execute()
            else:
                break
 
    except Exception as e:
        print(f"Error occurred: {e}")
        return []
 
    return comments

def save_comments_to_json(video_details, comments, filename):
    data = {
        'video_details': video_details,
        'comments': comments
    }
    with open(filename, "w") as file:
        json.dump(data, file, indent=4)

def save_comments_to_firestore(video_details, comments, video_id, publishedAt, profile):
    link = "https://www.youtube.com/watch?v=" + str(video_id)
    keywords = keyword_extraction(video_details['title'])
    today_date = datetime.datetime.today().strftime('%Y-%m-%d')
    data = {
        'dateIngested' :  today_date,
        'video_details': video_details,
        'comments': comments,
        'publishedAt': publishedAt,
        'link': link    
    }
    db.collection("youtube").document("accounts").collection(profile).document(video_id).set(data)

def scrape_youtube(profile, num):
    channel_id = profile
 
    channel_details = youtube.channels().list(
        part='contentDetails', id=channel_id
    ).execute()
    uploads_id=channel_details['items'][0]['contentDetails']['relatedPlaylists']['uploads']
    uploads_playlist = youtube.playlistItems().list(
            part="snippet,contentDetails",
            maxResults=num,
            playlistId=uploads_id
    ).execute()
 
    for item in uploads_playlist['items']:
        video_id = item['snippet']['resourceId']['videoId']
        video_details, publishedAt = get_video_details(video_id)
        video_comments = get_comments(video_id)
        # save_comments_to_json(video_details, video_comments, 'youtube_comments.json')
        save_comments_to_firestore(video_details, video_comments, video_id, publishedAt, profile)
    print("done")

def calculate_sentiment(comment):
    label, score = use_roberta([comment['comment']])
    return score[0]

def run_sentiment_analysis(profile):
    posts_collection = db.collection("youtube").document("accounts").collection(profile)
    posts = posts_collection.stream()
    for post in posts:
        num_positive = 0
        num_neutral = 0
        num_negative = 0
        post_dict = post.to_dict()
        sentiment_total = 0
        for comment in post_dict["comments"]:
            cur_comment_sent = calculate_sentiment(comment)
            comment["sentiment"] = cur_comment_sent

            if cur_comment_sent > 0.2:
                num_positive += 1
            elif cur_comment_sent < -0.2:
                num_negative += 1
            else:
                num_neutral += 1

            sentiment_total += cur_comment_sent
        num_comments = len(post_dict["comments"])
        sentiment = 0 if num_comments == 0 else sentiment_total / num_comments

        # post_dict["percent_pos"] = 0 if num_comments == 0 else (num_positive/num_comments) * 100
        # post_dict["percent_neut"] = 0 if num_comments == 0 else (num_neutral/num_comments) * 100
        # post_dict["percent_neg"] = 0 if num_comments == 0 else (num_negative/num_comments) * 100

        post_dict["sentiment"] = sentiment # Change to sentiment score value
        posts_collection.document(post.id).set(post_dict)
        # print(post_dict["video_details"]["title"] + ": " + str(sentiment))
    print("yee")


def run_keyword_extraction(profile):
    videos_collection = db.collection("youtube").document("accounts").collection(profile)
    videos = videos_collection.stream()
    for video in videos:
        video_dict = video.to_dict()

        # runs keywork extraction on the video title to get the topic of that video
        video_dict["topics"], emotion = keyword_extraction(video_dict["video_details"]["title"])
        
        videos_collection.document(video.id).set(video_dict)
        # print(post_dict["keywords"])

    print("keyword done")

# updates the list of likes in the general info (for overview likes chart)
def update_general(account):
    collection_ref = db.collection("general").document("combined")
    doc = collection_ref.get()

    youtube_stats_ref = db.collection("general").document("youtube")
    youtube_stats = youtube_stats_ref.get()

    today_date = datetime.datetime.today().strftime('%Y-%m-%d')

    # recent_post = ""

    if doc.exists:
        doc_dict = doc.to_dict()
        old_list = doc_dict["data_list"]
        last_entry = old_list[-1]
        # if the last entry is from today, append the youtube stats on 
        if ("date" in last_entry) and (today_date == last_entry["date"]):
            if youtube_stats.exists:
                stats_dict = youtube_stats.to_dict()
                last_entry["youtubeNumLikes"] = stats_dict["Total Likes"]
                last_entry["youtube_account"] = str(account)
                # recent_post = stats_dict["mostRecent"]
        # if the last entry isnt from today, make a new entry
        else:
            entry = {}
            entry["date"] = today_date
            if youtube_stats.exists:
                stats_dict = youtube_stats.to_dict()
                entry["youtubeNumLikes"] = stats_dict["Total Likes"]
                entry["youtube_account"] = str(account)

                # recent_post = stats_dict["mostRecent"]
            old_list.append(entry)

        # doc_dict["youtube_recent"] = recent_post

        # collection_ref.set(doc_dict)
    
    else:
        new_list = []
        entry = {}
        entry["date"] = today_date
        if youtube_stats.exists:
            stats_dict = youtube_stats.to_dict()
            entry["youtubeNumLikes"] = stats_dict["Total Likes"]
            entry["youtube_account"] = str(account)
            # recent_post = stats_dict["mostRecent"]
        new_list.append(entry)
        # collection_ref.set({"data_list": new_list})

        # print(new_list)

# gets data for sentiment/num posts chart for overview
def get_sentiment_chart_by_date(profile):
    posts_collection = db.collection("youtube").document("accounts").collection(profile)
    # today_date = datetime.datetime.today().strftime('%Y-%m-%d')
    query = posts_collection.order_by("dateIngested", direction=firestore.Query.DESCENDING)
    # query = posts_collection.where(filter=FieldFilter("dateIngested", "==", today_date))
    recent_ingested = query.get()

    numPosts_query = posts_collection.count()
    numPosts = numPosts_query.get()

    if len(recent_ingested) == 0:
        return {}

    # to get the general youtube data
    youtube_ref = db.collection("general").document("youtube")
    youtube_doc = youtube_ref.get()

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

    youtube_dict = {}

    # if the general stats for youtube exists and the account names match, add this list to that dictionary. otherwise just return a dictionary with this list
    if youtube_doc.exists:
        youtube_dict = youtube_doc.to_dict()
        if youtube_dict.get("accountName") == profile:
            youtube_dict["recentIngestedDate"] = most_recent_date
            youtube_dict["recentIngestedList"] = recent_ingested_list
            youtube_dict["numPosts"] = numPosts[0][0].value
            
    # else:
    #     youtube_dict["recentIngestedList"] = recent_ingested_list

    # print(recent_ingested_list)g
    return youtube_dict



def get_likes_comments(channelId):
    total_likes = 0
    total_comments = 0
    data = {}
    general_data = {}
    video_collection = db.collection("youtube").document("accounts").collection(channelId)
    query = video_collection.order_by("publishedAt").limit_to_last(1)
    most_recent_list = query.get()
    numVids = 0
    sentimentSum = 0
    numPositive = 0
    numNeutral = 0
    numNegative = 0

    vid_id = ""
    
    if len(most_recent_list) != 0:
        vid_id = most_recent_list[0].id
        most_recent = most_recent_list[0].to_dict()


    videos = video_collection.stream()
    for video in videos:
        vid_dict = video.to_dict()
        total_likes += int(vid_dict["video_details"]["likeCount"])
        total_comments += int(vid_dict["video_details"]["commentCount"])
        sentimentSum += vid_dict.get("sentiment", 0)
        numVids += 1
        # print(post.id)
        # print(post_dict["stats"]["likes"])
        sentiment = vid_dict.get("sentiment", -10)

        if sentiment != -10 and sentiment > 0.25:
            numPositive += 1
        elif sentiment != -10 and sentiment < -0.25:
            numNegative += 1
        elif sentiment != -10:
            numNeutral += 1

    sentiment = sentimentSum/numVids
    # print(sentiment)
    if sentiment > 0.25:
        data["General Sentiment"] = "Positive" 
    elif sentiment < -0.25:
        data["General Sentiment"] = "Negative" 
    else:
        data["General Sentiment"] = "Neutral" 

    data["Total Likes"] = total_likes
    data["Total Comments"] = total_comments

    general_data = data.copy()
    general_data["mostRecent"] = vid_id
    general_data["mostRecentNumLikes"] = most_recent["video_details"]["likeCount"]
    general_data["mostRecentSentiment"] = format(most_recent.get("sentiment", 0), ".2f")
    general_data["mostRecentNumComments"] = most_recent["video_details"].get("commentCount", 0)
    general_data["mostRecentDate"] = most_recent.get("publishedAt", "No date available")
    general_data["accountName"] = channelId
    general_data["numPositive"] = numPositive
    general_data["numNeutral"] = numNeutral
    general_data["numNegative"] = numNegative

    db.collection("general").document("youtube").set(general_data)

    # update_general(channelId)

    # print("got data")

    return data

def get_sentiment(element):
    return float(element['sentiment'])


def get_video_data(channelId):
    videos_collection = db.collection("youtube").document("accounts").collection(channelId)
    videos = videos_collection.stream()
    videos_list = []

    for video in videos:
        vid_dict = video.to_dict()
        temp = {}
        temp["link"] = vid_dict["link"]
        temp["title"] = vid_dict["video_details"]["title"]

        temp["sentiment"] = format(vid_dict.get("sentiment", 0), ".2f")
        temp["topics"] = vid_dict.get("topics", [])
        temp["comments"] = vid_dict.get("comments", [])
        temp["numComments"] = int(vid_dict["video_details"]["commentCount"])
        temp["datePosted"] = vid_dict.get("publishedAt", "")
        # temp["positive"] = format(vid_dict["percent_pos"], ".1f") + "%"
        # temp["neutral"] = format(vid_dict["percent_neut"], ".1f") + "%"
        # temp["negative"] = format(vid_dict["percent_neg"], ".1f") + "%"

        videos_list.append(temp)
    
    
    # print(videos_list)
    videos_list.sort(key=get_sentiment, reverse=True)

    return videos_list

def get_chart_data(channelId):
    videos_collection = db.collection("youtube").document("accounts").collection(channelId)
    videos = videos_collection.stream()
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
    for video in videos:
        video_dict = video.to_dict()
        
        sentiment = round(video_dict.get("sentiment", 0), 1)

        if -1.0 <= sentiment <= 1.0:
            data_dict[sentiment] += 1

        # add dicts to topic_list
        for topic in video_dict.get("topics", []):
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
    # print(data_list)
    return [data_list, topic_list]

def collection_exists(profile):
    posts_collection = db.collection("youtube").document("accounts").collection(profile).get()
    if (len(posts_collection) > 0):
        return True
    else:
        return False
    
def get_youtube_channel_name(channel_id):
    youtube2 = build('youtube', 'v3', developerKey=api_key)
    response = youtube2.channels().list(
        part='snippet',
        id=channel_id
    ).execute()

    # Check if the channel exists and get the channel name
    if response['items']:
        channel_name = response['items'][0]['snippet']['title']
        return channel_name
    else:
        return channel_id