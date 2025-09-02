from pymongo import MongoClient
import os

# MongoDB connection
MONGO_URI = os.getenv('MONGODB_URI', 'mongodb+srv://vaugheu:tempA@cluster0.yfpgp8o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
client = MongoClient(MONGO_URI)
db = client.get_database('DecentAIDB')

# Update the admin user
users_collection = db.users
result = users_collection.update_one(
    {'email': 'admin@admin.com'},
    {'$set': {'is_admin': True}}
)

if result.matched_count > 0:
    print("Admin user updated successfully!")
else:
    print("Admin user not found. Please make sure the user exists.")
