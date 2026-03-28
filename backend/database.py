# # from pymongo import MongoClient

# # # Replace <username> and <password> with your actual MongoDB Atlas credentials
# # MONGO_URI = "mongodb+srv://sejuchavan1812_db_user:ZigLI2s3aWwXKt8W@moodmusecluster.zqyjus3.mongodb.net/?retryWrites=true&w=majority&appName=MoodMuseCluster"

# # # Connect to MongoDB
# # client = MongoClient(MONGO_URI)

# # # Choose your database
# # db = client["MoodMuseDB"]

# # # Create a collection for diary entries
# # diary_collection = db.diary_entries

# # try:
# #     client.admin.command('ping')
# #     print("✅ MongoDB connected successfully!")
# # except Exception as e:
# #     print("❌ MongoDB connection error:", e)

# from pymongo import MongoClient
# import os

# # ================== CONFIG ==================

# # ⚠️ Best practice: env variable use karna
# # Windows CMD:
# # set MONGO_URI=your_connection_string
# #
# # Abhi direct likh rahe hain (learning phase)
# MONGO_URI = "mongodb+srv://sejuchavan1812_db_user:ZigLI2s3aWwXKt8W@moodmusecluster.zqyjus3.mongodb.net/?retryWrites=true&w=majority&appName=MoodMuseCluster"

# # ================== CONNECTION ==================
# client = MongoClient(MONGO_URI)

# # ================== DATABASE ==================
# db = client["MoodMuseDB"]

# # ================== COLLECTIONS ==================
# users_collection = db["users"]           # login / signup
# diary_collection = db["diary_entries"]   # diary data

# # ================== CONNECTION TEST ==================
# try:
#     client.admin.command("ping")
#     print("✅ MongoDB Atlas connected successfully")
# except Exception as e:
#     print("❌ MongoDB connection failed:", e)


from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)

db = client["MoodMuseDB"]
diary_collection = db["diary_entries"]
