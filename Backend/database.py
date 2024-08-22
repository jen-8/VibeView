import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

cred = credentials.Certificate("./key/coop2024spring-firebase-adminsdk-t0ln5-4c2f70f0a1.json")
app = firebase_admin.initialize_app(cred)
db_client = firestore.client()