from flask import Flask, jsonify, request, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
import json
from bson import json_util

app = Flask(__name__)
CORS(app, 
     resources={r"/*": {
         "origins": ["http://localhost:3000"],
         "methods": ["GET", "POST", "PUT", "DELETE"],
         "allow_headers": ["Content-Type"],
         "supports_credentials": True
     }})
app.secret_key = 'your-secret-key'

class CustomEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return json.JSONEncoder.default(self, obj)

app.json_encoder = CustomEncoder

# MongoDB connection
MONGO_URI = os.getenv('MONGODB_URI', 'mongodb+srv://vaugheu:tempA@cluster0.yfpgp8o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
client = MongoClient(MONGO_URI)
db = client.get_database('DecentAIDB') # Using 'DecentAIDB' as a placeholder database name

# Collections
users_collection = db.users
transactions_collection = db.transactions
chats_collection = db.chats
polls_collection = db.polls
analysis_history_collection = db.analysisHistory

@app.route('/users', methods=['GET'])
def get_users():
    users = list(users_collection.find({}, {'password': 0})) # Exclude password from results
    return json.loads(json_util.dumps(users))

@app.route('/transactions', methods=['GET'])
def get_transactions():
    try:
        user_id = request.args.get('userId')
        if not user_id:
            return jsonify({'error': 'userId is required'}), 400
            
        # Convert userId to ObjectId if it's a valid ObjectId string
        try:
            user_object_id = ObjectId(user_id)
        except:
            return jsonify({'error': 'Invalid userId format'}), 400

        # Filter transactions where user is either sender or receiver
        user_transactions = list(transactions_collection.find({
            '$or': [{'senderId': user_object_id}, {'receiverId': user_object_id}]
        }))
        
        return json.loads(json_util.dumps(user_transactions))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chats', methods=['GET'])
def get_chats():
    chats = list(chats_collection.find({}))
    return json.loads(json_util.dumps(chats))

@app.route('/polls', methods=['GET'])
def get_polls():
    polls = list(polls_collection.find({}))
    return json.loads(json_util.dumps(polls))

@app.route('/polls/<poll_id>', methods=['GET'])
def get_poll(poll_id):
    try:
        poll = polls_collection.find_one({'_id': ObjectId(poll_id)})
        if poll:
            return json.loads(json_util.dumps(poll))
        return jsonify({'error': 'Poll not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = users_collection.find_one({'_id': ObjectId(user_id)}, {'password': 0})
        if user:
            return json.loads(json_util.dumps(user))
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/transactions', methods=['POST'])
def create_transaction():
    try:
        transaction_data = request.json
        sender_id = ObjectId(transaction_data['senderId'])
        receiver_id = ObjectId(transaction_data['receiverId'])
        amount = transaction_data['amount']

        sender = users_collection.find_one({'_id': sender_id})
        if not sender or sender.get('points', 0) < amount:
            return jsonify({'error': 'Insufficient points or sender not found'}), 400

        users_collection.update_one({'_id': sender_id}, {'$inc': {'points': -amount}})
        users_collection.update_one({'_id': receiver_id}, {'$inc': {'points': amount}})

        new_transaction = {
            'senderId': sender_id,
            'receiverId': receiver_id,
            'amount': amount,
            'timestamp': datetime.utcnow().isoformat()
        }
        result = transactions_collection.insert_one(new_transaction)
        new_transaction['id'] = str(result.inserted_id)
        new_transaction['senderId'] = str(new_transaction['senderId'])
        new_transaction['receiverId'] = str(new_transaction['receiverId'])
        return json.loads(json_util.dumps(new_transaction)), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/auth/register', methods=['POST'])
def register():
    try:
        new_user_data = request.json
        
        if not new_user_data or 'username' not in new_user_data or 'password' not in new_user_data or 'email' not in new_user_data:
            return jsonify({'error': 'Missing required fields'}), 400
        
        if users_collection.find_one({'username': new_user_data['username']}):
            return jsonify({'error': 'Username already exists'}), 400
        if users_collection.find_one({'email': new_user_data['email']}):
            return jsonify({'error': 'Email already exists'}), 400
        
        new_user_data['password'] = generate_password_hash(new_user_data['password'])
        new_user_data['points'] = 0
        new_user_data['avatar'] = '/default-avatar.png'
        
        result = users_collection.insert_one(new_user_data)
        
        response_user = new_user_data.copy()
        response_user['id'] = str(result.inserted_id) # Convert ObjectId to string
        del response_user['password']
        return json.loads(json_util.dumps(response_user)), 201
    except Exception as e:
        print(f"Registration error: {e}") # Changed to print e directly
        return jsonify({'error': 'Server error'}), 500

@app.route('/auth/login', methods=['POST'])
def login():
    try:
        credentials = request.json
        
        if not credentials or 'username' not in credentials or 'password' not in credentials:
            return jsonify({'error': 'Missing username or password'}), 400
        
        user = users_collection.find_one({'username': credentials['username']})
        
        if user and check_password_hash(user['password'], credentials['password']):
            session['user_id'] = str(user['_id'])
            response_data = {
                'id': str(user['_id']),
                'username': user['username'],
                'email': user['email'],
                'points': user.get('points', 0),
                'avatar': user.get('avatar', '/default-avatar.png')
            }
            return json.loads(json_util.dumps(response_data))
        
        return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/auth/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out successfully'})

# User routes
@app.route('/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        user_data = request.json
        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {
                'username': user_data.get('username'),
                'email': user_data.get('email'),
                'points': user_data.get('points')
            }}
        )
        if result.matched_count:
            updated_user = users_collection.find_one({'_id': ObjectId(user_id)}, {'password': 0})
            return json.loads(json_util.dumps(updated_user))
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Poll routes
@app.route('/polls', methods=['POST'])
def create_poll():
    try:
        poll_data = request.json
        new_poll = {
            'title': poll_data['title'],
            'options': poll_data['options'],
            'votes': {option: 0 for option in poll_data['options']},
            'active': True
        }
        result = polls_collection.insert_one(new_poll)
        new_poll['id'] = str(result.inserted_id)
        return json.loads(json_util.dumps(new_poll)), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/polls/<poll_id>/vote', methods=['POST'])
def vote_poll(poll_id):
    try:
        vote_data = request.json
        poll = polls_collection.find_one({'_id': ObjectId(poll_id)})
        
        if not poll:
            return jsonify({'error': 'Poll not found'}), 404
            
        if not poll['active']:
            return jsonify({'error': 'Poll is closed'}), 400
            
        if vote_data['userId'] in poll.get('voters', []):
            return jsonify({'error': 'User has already voted'}), 400
            
        # Increment vote count for the chosen option
        polls_collection.update_one(
            {'_id': ObjectId(poll_id)},
            {'$inc': {f"votes.{vote_data['option']}": 1}}
        )
        
        # Add user to voters list
        polls_collection.update_one(
            {'_id': ObjectId(poll_id)},
            {'$addToSet': {'voters': vote_data['userId']}}
        )
        
        updated_poll = polls_collection.find_one({'_id': ObjectId(poll_id)})
        return json.loads(json_util.dumps(updated_poll))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Chat routes
@app.route('/chats', methods=['POST'])
def create_message():
    try:
        message_data = request.json
        new_message = {
            'roomId': message_data['roomId'],
            'userId': ObjectId(message_data['userId']), # Store userId as ObjectId
            'message': message_data['message'],
            'timestamp': datetime.utcnow().isoformat()
        }
        result = chats_collection.insert_one(new_message)
        new_message['id'] = str(result.inserted_id)
        new_message['userId'] = str(new_message['userId'])
        return json.loads(json_util.dumps(new_message)), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analysis-history', methods=['POST'])
def save_analysis_history():
    try:
        analysis_data = request.json
        new_analysis = {
            'text': analysis_data['text'],
            'sentiment': analysis_data['sentiment'],
            'confidence': analysis_data['confidence'],
            'score': analysis_data['score'],
            'timestamp': analysis_data['timestamp']
        }
        result = analysis_history_collection.insert_one(new_analysis)
        new_analysis['id'] = str(result.inserted_id)
        return json.loads(json_util.dumps(new_analysis)), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analysis-history', methods=['GET'])
def get_analysis_history():
    try:
        history = list(analysis_history_collection.find({}))
        for item in history:
            item['id'] = str(item['_id'])
        return json.loads(json_util.dumps(history))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analysis-history', methods=['DELETE'])
def clear_analysis_history():
    try:
        analysis_history_collection.delete_many({})
        return jsonify({'message': 'Analysis history cleared'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add this new route for analytics
@app.route('/analytics/transactions', methods=['GET'])
def get_all_transactions():
    try:
        transactions = list(transactions_collection.find({}))
        for transaction in transactions:
            transaction['id'] = str(transaction['_id'])
            transaction['senderId'] = str(transaction['senderId'])
            transaction['receiverId'] = str(transaction['receiverId'])
        return json.loads(json_util.dumps(transactions))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 