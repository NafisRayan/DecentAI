from flask import Flask, jsonify, request, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app, 
     resources={r"/*": {
         "origins": ["http://localhost:3000"],
         "methods": ["GET", "POST", "PUT", "DELETE"],
         "allow_headers": ["Content-Type"],
         "supports_credentials": True
     }})
app.secret_key = 'your-secret-key'

def load_data():
    try:
        with open('backend/data/db.json', 'r') as file:
            return json.load(file)
    except Exception as e:
        print(f"Error loading data: {str(e)}")
        return {"users": [], "transactions": [], "chats": [], "polls": []}

def save_data(data):
    try:
        with open('backend/data/db.json', 'w') as file:
            json.dump(data, file, indent=4)
    except Exception as e:
        print(f"Error saving data: {str(e)}")

@app.route('/users', methods=['GET'])
def get_users():
    data = load_data()
    return jsonify(data['users'])

@app.route('/transactions', methods=['GET'])
def get_transactions():
    try:
        user_id = request.args.get('userId')
        if not user_id:
            return jsonify({'error': 'userId is required'}), 400
            
        user_id = int(user_id)
        data = load_data()
        
        # Filter transactions where user is either sender or receiver
        user_transactions = [
            t for t in data['transactions'] 
            if t['senderId'] == user_id or t['receiverId'] == user_id
        ]
        
        return jsonify(user_transactions)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chats', methods=['GET'])
def get_chats():
    data = load_data()
    return jsonify(data['chats'])

@app.route('/polls', methods=['GET'])
def get_polls():
    data = load_data()
    return jsonify(data['polls'])

@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    data = load_data()
    user = next((user for user in data['users'] if user['id'] == user_id), None)
    return jsonify(user) if user else ('User not found', 404)

@app.route('/transactions', methods=['POST'])
def create_transaction():
    try:
        data = load_data()
        transaction = request.json
        
        # Validate sender has enough points
        sender = next((user for user in data['users'] if user['id'] == transaction['senderId']), None)
        if not sender or sender['points'] < transaction['amount']:
            return jsonify({'error': 'Insufficient points'}), 400
            
        # Update points
        sender['points'] -= transaction['amount']
        receiver = next((user for user in data['users'] if user['id'] == transaction['receiverId']), None)
        if receiver:
            receiver['points'] += transaction['amount']
            
        # Add transaction with proper generator expression parentheses
        transaction_id = max((t['id'] for t in data['transactions']), default=0) + 1
        new_transaction = {
            'id': transaction_id,
            'senderId': transaction['senderId'],
            'receiverId': transaction['receiverId'],
            'amount': transaction['amount'],
            'timestamp': datetime.utcnow().isoformat()
        }
        data['transactions'].append(new_transaction)
        save_data(data)
        return jsonify(new_transaction), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/auth/register', methods=['POST'])
def register():
    try:
        data = load_data()
        new_user = request.json
        
        if not new_user or 'username' not in new_user or 'password' not in new_user or 'email' not in new_user:
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check if username or email already exists
        if any(user['username'] == new_user['username'] for user in data['users']):
            return jsonify({'error': 'Username already exists'}), 400
        if any(user['email'] == new_user['email'] for user in data['users']):
            return jsonify({'error': 'Email already exists'}), 400
        
        # Create new user with ID 1 if no users exist, otherwise increment max ID
        user_id = 1 if not data['users'] else max(user['id'] for user in data['users']) + 1
        new_user['id'] = user_id
        new_user['points'] = 0
        new_user['avatar'] = '/default-avatar.png'
        new_user['password'] = generate_password_hash(new_user['password'])
        
        data['users'].append(new_user)
        save_data(data)
        
        # Remove password from response
        response_user = new_user.copy()
        del response_user['password']
        return jsonify(response_user), 201
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/auth/login', methods=['POST'])
def login():
    try:
        data = load_data()
        credentials = request.json
        
        if not credentials or 'username' not in credentials or 'password' not in credentials:
            return jsonify({'error': 'Missing username or password'}), 400
        
        user = next((user for user in data['users'] 
                     if user['username'] == credentials['username']), None)
        
        if user and check_password_hash(user['password'], credentials['password']):
            session['user_id'] = user['id']
            response = jsonify({
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'points': user['points'],
                'avatar': user['avatar']
            })
            return response
        
        return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/auth/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out successfully'})

# User routes
@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        data = load_data()
        user_data = request.json
        user = next((user for user in data['users'] if user['id'] == user_id), None)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        user.update({
            'username': user_data.get('username', user['username']),
            'email': user_data.get('email', user['email'])
        })
        save_data(data)
        return jsonify(user)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Poll routes
@app.route('/polls', methods=['POST'])
def create_poll():
    try:
        data = load_data()
        poll = request.json
        poll_id = max((p['id'] for p in data['polls']), default=0) + 1
        new_poll = {
            'id': poll_id,
            'title': poll['title'],
            'options': poll['options'],
            'votes': {option: 0 for option in poll['options']},
            'active': True
        }
        data['polls'].append(new_poll)
        save_data(data)
        return jsonify(new_poll), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/polls/<int:poll_id>/vote', methods=['POST'])
def vote_poll(poll_id):
    try:
        data = load_data()
        vote = request.json
        poll = next((p for p in data['polls'] if p['id'] == poll_id), None)
        
        if not poll:
            return jsonify({'error': 'Poll not found'}), 404
            
        if not poll['active']:
            return jsonify({'error': 'Poll is closed'}), 400
            
        if vote['userId'] in poll.get('voters', []):
            return jsonify({'error': 'User has already voted'}), 400
            
        poll['votes'][vote['option']] += 1
        if 'voters' not in poll:
            poll['voters'] = []
        poll['voters'].append(vote['userId'])
        
        save_data(data)
        return jsonify(poll)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Chat routes
@app.route('/chats', methods=['POST'])
def create_message():
    try:
        data = load_data()
        message = request.json
        message_id = max((c['id'] for c in data['chats']), default=0) + 1
        new_message = {
            'id': message_id,
            'roomId': message['roomId'],
            'userId': message['userId'],
            'message': message['message'],
            'timestamp': datetime.utcnow().isoformat()
        }
        data['chats'].append(new_message)
        save_data(data)
        return jsonify(new_message), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analysis-history', methods=['POST'])
def save_analysis_history():
    try:
        data = load_data()
        analysis = request.json
        
        # Ensure the 'analysisHistory' key exists in the data
        if 'analysisHistory' not in data:
            data['analysisHistory'] = []
        
        # Add a new analysis entry
        analysis_id = max((a['id'] for a in data['analysisHistory']), default=0) + 1
        new_analysis = {
            'id': analysis_id,
            'text': analysis['text'],
            'sentiment': analysis['sentiment'],
            'confidence': analysis['confidence'],
            'score': analysis['score'],
            'timestamp': analysis['timestamp']
        }
        data['analysisHistory'].append(new_analysis)
        save_data(data)
        return jsonify(new_analysis), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analysis-history', methods=['GET'])
def get_analysis_history():
    try:
        data = load_data()
        return jsonify(data.get('analysisHistory', []))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analysis-history', methods=['DELETE'])
def clear_analysis_history():
    try:
        data = load_data()
        data['analysisHistory'] = []  # Clear the analysis history
        save_data(data)
        return jsonify({'message': 'Analysis history cleared'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add this new route for analytics
@app.route('/analytics/transactions', methods=['GET'])
def get_all_transactions():
    try:
        data = load_data()
        return jsonify(data['transactions'])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 