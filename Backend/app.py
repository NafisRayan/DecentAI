from flask import Flask, jsonify, request, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
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
admin_requests_collection = db.adminRequests

@app.route('/users', methods=['GET'])
def get_users():
    users = list(users_collection.find({}, {'password': 0}).sort('created_at', -1)) # Exclude password from results and sort by created_at descending
    # Convert ObjectIds to strings for frontend consistency
    for user in users:
        user['id'] = str(user['_id'])
        del user['_id']
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
        }).sort('timestamp', -1))  # Sort by timestamp descending (newest first)
        
        return json.loads(json_util.dumps(user_transactions))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chats', methods=['GET'])
def get_chats():
    chats = list(chats_collection.find({}).sort('timestamp', -1))  # Sort by timestamp descending (newest first)
    # Convert ObjectIds to strings for frontend consistency
    for chat in chats:
        chat['id'] = str(chat['_id'])
        chat['userId'] = str(chat['userId'])
        del chat['_id']
    return json.loads(json_util.dumps(chats))

@app.route('/polls', methods=['GET'])
def get_polls():
    polls = list(polls_collection.find({}).sort('created_at', -1))  # Sort by created_at descending (newest first)
    for poll in polls:
        poll['id'] = str(poll['_id'])
        # Convert ObjectIds in voters array to strings for frontend consistency
        if 'voters' in poll and poll['voters']:
            poll['voters'] = [str(voter_id) for voter_id in poll['voters']]
    return json.loads(json_util.dumps(polls))

@app.route('/polls/<poll_id>', methods=['GET'])
def get_poll(poll_id):
    try:
        poll = polls_collection.find_one({'_id': ObjectId(poll_id)})
        if poll:
            poll['id'] = str(poll['_id'])
            # Convert ObjectIds in voters array to strings for frontend consistency
            if 'voters' in poll and poll['voters']:
                poll['voters'] = [str(voter_id) for voter_id in poll['voters']]
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
            'timestamp': (datetime.utcnow() + timedelta(hours=6)).isoformat()
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
        new_user_data['is_admin'] = False  # Add admin status
        # Use Bangladesh time (UTC+6)
        bangladesh_time = datetime.utcnow() + timedelta(hours=6)
        new_user_data['created_at'] = bangladesh_time.isoformat()
        
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
                'avatar': user.get('avatar', '/default-avatar.png'),
                'is_admin': user.get('is_admin', False)
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
                'points': user_data.get('points'),
                'is_admin': user_data.get('is_admin', False)
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
        # Use Bangladesh time (UTC+6)
        bangladesh_time = datetime.utcnow() + timedelta(hours=6)
        new_poll = {
            'title': poll_data['title'],
            'options': poll_data['options'],
            'votes': {option: 0 for option in poll_data['options']},
            'active': True,
            'created_at': bangladesh_time.isoformat()
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
            
        # Check if user has already voted
        user_object_id = ObjectId(vote_data['userId'])
        if str(user_object_id) in [str(voter_id) for voter_id in poll.get('voters', [])]:
            return jsonify({'error': 'User has already voted'}), 400
            
        # Increment vote count for the chosen option
        polls_collection.update_one(
            {'_id': ObjectId(poll_id)},
            {'$inc': {f"votes.{vote_data['option']}": 1}}
        )
        
        # Add user to voters list
        polls_collection.update_one(
            {'_id': ObjectId(poll_id)},
            {'$addToSet': {'voters': user_object_id}}
        )
        
        updated_poll = polls_collection.find_one({'_id': ObjectId(poll_id)})
        updated_poll['id'] = str(updated_poll['_id'])
        return json.loads(json_util.dumps(updated_poll))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/polls/<poll_id>/toggle-active', methods=['POST'])
def toggle_poll_active(poll_id):
    try:
        poll = polls_collection.find_one({'_id': ObjectId(poll_id)})
        
        if not poll:
            return jsonify({'error': 'Poll not found'}), 404
            
        # Toggle the active status
        new_active_status = not poll.get('active', True)
        
        polls_collection.update_one(
            {'_id': ObjectId(poll_id)},
            {'$set': {'active': new_active_status}}
        )
        
        updated_poll = polls_collection.find_one({'_id': ObjectId(poll_id)})
        updated_poll['id'] = str(updated_poll['_id'])
        return json.loads(json_util.dumps(updated_poll))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Chat routes
@app.route('/chats', methods=['POST'])
def create_message():
    try:
        message_data = request.json
        if not message_data or 'userId' not in message_data or 'message' not in message_data:
            return jsonify({'error': 'userId and message are required'}), 400
            
        new_message = {
            'roomId': message_data.get('roomId', 'public'),
            'userId': ObjectId(message_data['userId']),
            'message': message_data['message'],
            'timestamp': (datetime.utcnow() + timedelta(hours=6)).isoformat()
        }
        result = chats_collection.insert_one(new_message)
        new_message['id'] = str(result.inserted_id)
        new_message['userId'] = str(new_message['userId'])  # Convert to string for frontend
        return json.loads(json_util.dumps(new_message)), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/clear-chats', methods=['DELETE'])
def clear_all_chats():
    try:
        # Get count before deletion for response
        chat_count = chats_collection.count_documents({})

        # Delete all chat messages
        result = chats_collection.delete_many({})

        return jsonify({
            'message': f'Successfully cleared {chat_count} chat messages',
            'deleted_count': chat_count
        }), 200
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
        history = list(analysis_history_collection.find({}).sort('timestamp', -1))  # Sort by timestamp descending (newest first)
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
        transactions = list(transactions_collection.find({}).sort('timestamp', -1))  # Sort by timestamp descending (newest first)
        for transaction in transactions:
            transaction['id'] = str(transaction['_id'])
            transaction['senderId'] = str(transaction['senderId'])
            transaction['receiverId'] = str(transaction['receiverId'])
        return json.loads(json_util.dumps(transactions))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Admin Routes
@app.route('/admin/make-admin', methods=['POST'])
def make_admin():
    try:
        data = request.json
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
            
        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'is_admin': True}}
        )
        
        if result.matched_count:
            return jsonify({'message': 'User promoted to admin successfully'}), 200
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/remove-admin', methods=['POST'])
def remove_admin():
    try:
        data = request.json
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
            
        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'is_admin': False}}
        )
        
        if result.matched_count:
            return jsonify({'message': 'Admin status removed successfully'}), 200
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/delete-user/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        # First, get the user to check if they exist
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Delete all related data in cascade
        # 1. Delete user's transactions (both as sender and receiver)
        transactions_collection.delete_many({
            '$or': [{'senderId': ObjectId(user_id)}, {'receiverId': ObjectId(user_id)}]
        })

        # 2. Delete user's chat messages
        chats_collection.delete_many({'userId': ObjectId(user_id)})

        # 3. Delete polls created by the user
        polls_collection.delete_many({'creatorId': ObjectId(user_id)})

        # 4. Delete admin requests from the user
        admin_requests_collection.delete_many({'user_id': ObjectId(user_id)})

        # 5. Delete analysis history from the user
        analysis_history_collection.delete_many({'userId': ObjectId(user_id)})

        # 6. Finally, delete the user
        result = users_collection.delete_one({'_id': ObjectId(user_id)})

        if result.deleted_count:
            return jsonify({
                'message': 'User and all related data deleted successfully',
                'deleted_data': {
                    'user': 1,
                    'transactions': 'all related',
                    'chat_messages': 'all related',
                    'polls': 'all created by user',
                    'admin_requests': 'all related',
                    'analysis_history': 'all related'
                }
            }), 200
        return jsonify({'error': 'Failed to delete user'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/delete-poll/<poll_id>', methods=['DELETE'])
def delete_poll(poll_id):
    try:
        result = polls_collection.delete_one({'_id': ObjectId(poll_id)})
        
        if result.deleted_count:
            return jsonify({'message': 'Poll deleted successfully'}), 200
        return jsonify({'error': 'Poll not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/delete-admin-request/<request_id>', methods=['DELETE'])
def delete_admin_request(request_id):
    try:
        result = admin_requests_collection.delete_one({'_id': ObjectId(request_id)})
        
        if result.deleted_count:
            return jsonify({'message': 'Admin request deleted successfully'}), 200
        return jsonify({'error': 'Admin request not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Admin Request Routes
@app.route('/admin-requests', methods=['POST'])
def create_admin_request():
    try:
        data = request.json
        user_id = data.get('user_id')
        reason = data.get('reason', '')
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
            
        # Check if user already has a pending request
        existing_request = admin_requests_collection.find_one({
            'user_id': user_id,
            'status': 'pending'
        })
        
        if existing_request:
            return jsonify({'error': 'You already have a pending admin request'}), 400
            
        new_request = {
            'user_id': user_id,
            'reason': reason,
            'status': 'pending',
            'created_at': (datetime.utcnow() + timedelta(hours=6)).isoformat()
        }
        
        result = admin_requests_collection.insert_one(new_request)
        new_request['id'] = str(result.inserted_id)
        return json.loads(json_util.dumps(new_request)), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin-requests', methods=['GET'])
def get_admin_requests():
    try:
        requests = list(admin_requests_collection.find({}).sort('created_at', -1))  # Sort by created_at descending
        for request_item in requests:
            request_item['id'] = str(request_item['_id'])
            del request_item['_id']
        return json.loads(json_util.dumps(requests))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin-requests/<request_id>/approve', methods=['POST'])
def approve_admin_request(request_id):
    try:
        # Update request status
        result = admin_requests_collection.update_one(
            {'_id': ObjectId(request_id)},
            {'$set': {'status': 'approved'}}
        )
        
        if result.matched_count:
            # Get the request to find user_id
            request_doc = admin_requests_collection.find_one({'_id': ObjectId(request_id)})
            if request_doc:
                # Make user admin
                users_collection.update_one(
                    {'_id': ObjectId(request_doc['user_id'])},
                    {'$set': {'is_admin': True}}
                )
            return jsonify({'message': 'Admin request approved'}), 200
        return jsonify({'error': 'Request not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin-requests/<request_id>/reject', methods=['POST'])
def reject_admin_request(request_id):
    try:
        result = admin_requests_collection.update_one(
            {'_id': ObjectId(request_id)},
            {'$set': {'status': 'rejected'}}
        )
        
        if result.matched_count:
            return jsonify({'message': 'Admin request rejected'}), 200
        return jsonify({'error': 'Request not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin-requests/<request_id>/reapply', methods=['POST'])
def reapply_admin_request(request_id):
    try:
        # Get the existing request
        existing_request = admin_requests_collection.find_one({'_id': ObjectId(request_id)})
        if not existing_request:
            return jsonify({'error': 'Request not found'}), 404
            
        # Check if user already has a pending request
        pending_request = admin_requests_collection.find_one({
            'user_id': existing_request['user_id'],
            'status': 'pending'
        })
        
        if pending_request:
            return jsonify({'error': 'You already have a pending admin request'}), 400
            
        # Create new request with updated reason if provided
        data = request.json or {}
        new_reason = data.get('reason', existing_request.get('reason', ''))
        
        new_request = {
            'user_id': existing_request['user_id'],
            'reason': new_reason,
            'status': 'pending',
            'created_at': (datetime.utcnow() + timedelta(hours=6)).isoformat()
        }
        
        result = admin_requests_collection.insert_one(new_request)
        new_request['id'] = str(result.inserted_id)
        return json.loads(json_util.dumps(new_request)), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin-requests/user/<user_id>', methods=['GET'])
def get_user_admin_request(user_id):
    try:
        request_doc = admin_requests_collection.find_one({'user_id': user_id})
        if request_doc:
            request_doc['id'] = str(request_doc['_id'])
            del request_doc['_id']
            return json.loads(json_util.dumps(request_doc))
        return jsonify({'message': 'No admin request found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 