from flask import Flask, request
import twitter
import linkedin
import youtube
from flask_cors import CORS, cross_origin
import os
from recommendation import recommendation

import random

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route("/")
def hello_world():
    return "<p>Hello, World!<p>"


@app.post("/test")
@cross_origin()
def data_ingestion():
    request.get_data()
    # print(request.data)
    # TODO: get request data parameters
    twitter_account = 'Disney'
    linkedin_account = 'the-walt-disney-company'
    youtube_account = 'UCFtEEv80fQVKkD4h1PF-Xqw'
    twitter.scrape_twitter(twitter_account, 1)
    linkedin.scrape_linkedin(linkedin_account, 10)
    youtube.scrape_youtube(youtube_account, 10)

    twitter.run_sentiment_analysis(twitter_account)
    linkedin.run_sentiment_analysis(linkedin_account)
    youtube.run_sentiment_analysis(youtube_account)
    return "yee"

@app.post("/linkedin-ingestion")
@cross_origin()
def linkedin_ingestion():
    account = ""
    num = 0
    if request.content_type == "application/json":
    # print(request.json)
        account = request.json.get("account")
        num = int(request.json.get("num"))
    else:
        account = request.form.get("account")
        num = int(request.json.get("num"))

    # print(account)
    # print(num)

    if account == "" or num == 0:
        return f"Invalid Input", 400

    try:
        linkedin.scrape_linkedin(account, num)
        linkedin.run_sentiment_analysis(account)
        linkedin.run_keyword_extraction(account)

        # linkedin.get_likes_shares(account)
    except Exception as error:
        print("An error occured: " + str(error))
        return f"An error occured: {str(error)}", 400

    return "linkedin done"


@app.post("/twitter-ingestion")
@cross_origin()
def twitter_ingestion():
    
    account = ""
    num = 0
    if request.content_type == "application/json":
        account = request.json.get("account")
        num = int(request.json.get("num"))
        timezone = request.json.get("timezone")
    else:
        account = request.form.get("account")
        num = int(request.json.get("num"))
        timezone = request.json.get("timezone")

    # print(account)
    # print(num)
    if account == "" or num == 0:
        return f"Invalid Input", 400
    
    isIngested = False

    try:
        isIngested = twitter.scrape_twitter(account, num, timezone)

        if isIngested:
            twitter.run_sentiment_analysis(account)
            twitter.run_keyword_extraction(account)

            # update the general data collection
            # twitter.get_likes_retweets(account)
    except Exception as error:
        print("An error occured: " + str(error))
        return f"An error occured: {error}", 400

    return "twitter done"

@app.post("/youtube-ingestion")
@cross_origin()
def youtube_ingestion():
    
    account = ""
    num = 0
    if request.content_type == "application/json":
        account = request.json.get("account")
        num = int(request.json.get("num"))
    else:
        account = request.form.get("account")
        num = int(request.json.get("num"))

    # print(account)
    # print(num)
    if account == "" or num == 0:
        return f"Invalid Input", 400

    try:
        youtube.scrape_youtube(account, num)
        youtube.run_sentiment_analysis(account)
        youtube.run_keyword_extraction(account)

        # update the general data collection
        # youtube.get_likes_comments(account)
    except Exception as error:
        print("An error occured: " + str(error))
        return f"An error occured: {str(error)}", 400

    return "youtube done"

@app.post("/twitter-stats")
@cross_origin()
def get_twitter_data():
    account = ""
    if request.content_type == "application/json":
        account = request.json.get("account")
    else:
        account = request.form.get("account")
    if account == "":
        return f"Invalid Input", 400

    try:
        data = twitter.get_likes_retweets(account)

        return_list = []

        for key in data.keys():
            temp = {}
            temp["title"] = key
            temp["text"] = data[key]
            return_list.append(temp)
    except Exception as error:
        print("An error occured: " + str(error))
        return f"An error occured: {error}", 400
        # print(return_list)

    return return_list


@app.post("/youtube-stats")
@cross_origin()
def get_youtube_stats():
    account = ""
    if request.content_type == "application/json":
        account = request.json.get("account")
    else:
        account = request.form.get("account")
    if account == "":
        return f"Invalid Input", 400

    data = youtube.get_likes_comments(account)
    try:
        # data = youtube.get_likes_comments('UCFtEEv80fQVKkD4h1PF-Xqw')

        return_list = []

        for key in data.keys():
            temp = {}
            temp["title"] = key
            temp["text"] = data[key]
            return_list.append(temp)
    except Exception as error:
        print("An error occured: " + str(error))
        return f"An error occured: {str(error)}", 400

    return return_list

@app.post("/linkedin-stats")
@cross_origin()
def get_linkedin_stats():
    account = ""
    if request.content_type == "application/json":
        account = request.json.get("account")
    else:
        account = request.form.get("account")
    # data = linkedin.get_likes_shares('the-walt-disney-company')
    if account == "":
        return f"Invalid Input", 400

    try:
        data = linkedin.get_likes_shares(account)
        return_list = []

        for key in data.keys():
            temp = {}
            temp["title"] = key
            temp["text"] = data[key]
            return_list.append(temp)
    except Exception as error:
        print("An error occured: " + str(error))
        return f"An error occured: {error}", 400

    return return_list

@app.post("/twitter-posts")
@cross_origin()
def get_post_data():
    account = ""
    if request.content_type == "application/json":
        account = request.json.get("account")
    else:
        account = request.form.get("account")
    if account == "":
        return f"Invalid Input", 400

    try:
        posts_list = twitter.get_post_data(account)
    except Exception as error:
        print("An error occured: " + str(error))
        return f"An error occured: {error}", 400
    # posts_list = twitter.get_post_data('Disney')
    return posts_list

@app.post("/youtube-videos")
@cross_origin()
def get_vid_data():
    account = ""
    if request.content_type == "application/json":
        account = request.json.get("account")
    else:
        account = request.form.get("account")
    if account == "":
        return f"Invalid Input", 400

    try:
        vids_list = youtube.get_video_data(account)
    except Exception as error:
        print("An error occured: " + str(error))
        return f"An error occured: {error}", 400
    # vids_list = youtube.get_video_data('UCFtEEv80fQVKkD4h1PF-Xqw')
    return vids_list

@app.post("/linkedin-posts")
@cross_origin()
def get_linkedin_post_data():
    account = ""
    if request.content_type == "application/json":
        account = request.json.get("account")
    else:
        account = request.form.get("account")
    if account == "":
        return f"Invalid Input", 400

    try:
        posts_list = linkedin.get_posts_data(account)
    except Exception as error:
        print("An error occured: " + str(error))
        return f"An error occured: {error}", 400
    # print(posts_list)
    return posts_list

@app.post("/twitter-chart")
@cross_origin()
def get_twitter_chart_data():
    account = ""
    if request.content_type == "application/json":
        account = request.json.get("account")
    else:
        account = request.form.get("account")
    if account == "":
        return f"Invalid Input", 400

    try:
    # # return 2 lists, first is the list of sentiments and numPosts, and second is the list of topics and sentiments
        lists = twitter.get_chart_data(account)
    except Exception as error:
        print("An error occured: " + str(error))
        return f"An error occured: {error}", 400
    return lists

@app.post("/youtube-chart")
@cross_origin()
def get_youtube_chart_data():
    account = ""
    if request.content_type == "application/json":
        account = request.json.get("account")
    else:
        account = request.form.get("account")
    if account == "":
        return f"Invalid Input", 400

    try:
        lists = youtube.get_chart_data(account)
    except Exception as error:
        print("An error occured: " + str(error))
        return f"An error occured: {error}", 400
    return lists

@app.post("/linkedin-chart")
@cross_origin()
def get_linkedin_chart_data():
    account = ""
    account = ""
    if request.content_type == "application/json":
        account = request.json.get("account")
    else:
        account = request.form.get("account")

    if account == "":
        return f"Invalid Input", 400

    try:
        lists = linkedin.get_chart_data(account)
    except Exception as error:
        print("An error occured: " + str(error))
        return f"An error occured: {error}", 400
    return lists

# we dont use the topic list anymore

# @app.post("/twitter-topics")
# @cross_origin()
# def get_topic_data():
#     account = ""
#     if request.content_type == "application/json":
#         account = request.json.get("account")
#     else:
#         account = request.form.get("account")
#     topic_list = twitter.get_topic_data(account)
#     # topic_list = twitter.get_topic_data('Disney')
#     return topic_list

@app.post("/twitter-exists")
@cross_origin()
def get_twitter_collection_exists():
    account = ""
    if request.content_type == "application/json":
        account = request.json.get("account")
    else:
        account = request.form.get("account")
    if account == "":
        return f"Invalid Input", 400

    try:
        result = {"result": twitter.collection_exists(account)}
    except Exception as error:
        print("An error occured: " + str(error))
        return f"An error occured: {error}", 400
    return result

@app.post("/youtube-exists")
@cross_origin()
def get_youtube_collection_exists():
    account = ""
    if request.content_type == "application/json":
        account = request.json.get("account")
    else:
        account = request.form.get("account")
    if account == "":
        return f"Invalid Input", 400

    try:
        result = {"result": youtube.collection_exists(account)}
    except Exception as error:
        print("An error occured: " + str(error))
        return f"An error occured: {error}", 400
    return result

@app.post("/linkedin-exists")
@cross_origin()
def get_linkedin_collection_exists():
    account = ""
    if request.content_type == "application/json":
        account = request.json.get("account")
    else:
        account = request.form.get("account")
    if account == "":
        return f"Invalid Input", 400

    try:
        result = {"result": linkedin.collection_exists(account)}
    except Exception as error:
        print("An error occured: " + str(error))
        return f"An error occured: {error}", 400
    return result

@app.post("/recommendations")
@cross_origin()
def get_recommendations():
    platform = request.json.get("platform")
    account = request.json.get("account")
    if account == "" or platform == "":
        return f"Invalid Input", 400

    try:
        if platform == "twitter":
            topics_list = twitter.get_chart_data(account)[1]
        elif platform == "youtube":
            topics_list = youtube.get_chart_data(account)[1]
        else:
            topics_list = linkedin.get_chart_data(account)[1]
        # topic = lists.get("topic")
        resp = recommendation(topics_list)
    except Exception as error:
        print("An error occured: " + str(error))
        return f"An error occured: {error}", 400
    # print(f"Response: {resp}")
    return resp

# @app.get("/general-stats")
# @cross_origin()
# def get_general_data():
#     data = twitter.get_general_data()
#     return data

@app.post("/general-stats")
@cross_origin()
def get_twitter_chart():
    twitter_account = ""
    youtube_account = ""
    linkedin_account = ""
    if request.content_type == "application/json":
        twitter_account = request.json.get("twitterAccount")
        youtube_account = request.json.get("youtubeAccount")
        linkedin_account = request.json.get("linkedinAccount")
    else:
        twitter_account = request.form.get("twitterAccount")
        youtube_account = request.form.get("youtubeAccount")
        linkedin_account = request.form.get("linkedinAccount")

    twitter.get_likes_retweets(twitter_account)
    youtube.get_likes_comments(youtube_account)
    linkedin.get_likes_shares(linkedin_account)

    twitter_chart_data = twitter.get_sentiment_chart_by_date(twitter_account)
    youtube_chart_data = youtube.get_sentiment_chart_by_date(youtube_account)
    linkedin_chart_data = linkedin.get_sentiment_chart_by_date(linkedin_account)
    
    youtube_chart_data['accountName'] = youtube.get_youtube_channel_name(youtube_chart_data['accountName'])
    return [twitter_chart_data, youtube_chart_data, linkedin_chart_data]

    
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
