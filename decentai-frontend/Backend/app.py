from flask import Flask, jsonify, request, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os

app = Flask(__name__)
CORS(app, 
     resources={r"/*": {
         "origins": ["http://localhost:3000"],
         "methods": ["GET", "POST", "PUT", "DELETE"],
         "allow_headers": ["Content-Type"],
         "supports_credentials": True
     }})
app.secret_key = 'your-secret-key'  # Change this to a secure secret key

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
    data = load_data()
    return jsonify(data['transactions'])

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
def add_transaction():
    data = load_data()
    new_transaction = request.json
    data['transactions'].append(new_transaction)
    save_data(data)
    return jsonify(new_transaction), 201

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

# Add more routes as needed for other operations

if __name__ == '__main__':
    app.run(debug=True, port=5000) 