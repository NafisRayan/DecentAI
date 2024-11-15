from flask import Flask, jsonify, request
import json

app = Flask(__name__)

# Load data from db.json
def load_data():
    with open('src/data/db.json', 'r') as file:
        return json.load(file)

# Save data to db.json
def save_data(data):
    with open('src/data/db.json', 'w') as file:
        json.dump(data, file, indent=4)

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

# Add more routes as needed for other operations

if __name__ == '__main__':
    app.run(debug=True) 