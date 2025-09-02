import requests
import json
import random
import string
import datetime

BASE_URL = "http://localhost:5000"

# Store IDs for subsequent tests
user_ids = []
poll_ids = []
transaction_ids = []
chat_ids = []
analysis_history_ids = []

user_data_for_login = {} # To store username and password for login test

def generate_random_string(length=10):
    return ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(length))

def test_register_user():
    global user_ids, user_data_for_login
    print("Testing /auth/register")
    username = generate_random_string(8)
    password = generate_random_string(12)
    email = f"{generate_random_string(5)}@{generate_random_string(5)}.com"
    data = {"username": username, "password": password, "email": email}
    response = requests.post(f"{BASE_URL}/auth/register", json=data)
    print(f"Register Response: {response.status_code} {response.json()}")
    assert response.status_code == 201
    user_ids.append(response.json()['id'])
    user_data_for_login = {"username": username, "password": password}

def test_login_user():
    global user_data_for_login
    print("Testing /auth/login")
    if not user_data_for_login:
        test_register_user() # Ensure there's a user to login
    
    data = user_data_for_login
    response = requests.post(f"{BASE_URL}/auth/login", json=data)
    print(f"Login Response: {response.status_code} {response.json()}")
    assert response.status_code == 200

def test_get_users():
    print("Testing GET /users")
    response = requests.get(f"{BASE_URL}/users")
    print(f"Get Users Response: {response.status_code} {response.json()}")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_user_by_id():
    global user_ids
    print("Testing GET /users/<user_id>")
    if not user_ids:
        test_register_user()
    
    user_id = user_ids[0]
    response = requests.get(f"{BASE_URL}/users/{user_id}")
    print(f"Get User by ID Response: {response.status_code} {response.json()}")
    assert response.status_code == 200
    assert response.json()['_id']['$oid'] == user_id

def test_update_user():
    global user_ids
    print("Testing PUT /users/<user_id>")
    if not user_ids:
        test_register_user()
    
    user_id = user_ids[0]
    new_username = generate_random_string(10)
    new_email = f"{generate_random_string(5)}@{generate_random_string(5)}.com"
    data = {"username": new_username, "email": new_email, "points": random.randint(1, 100)}
    response = requests.put(f"{BASE_URL}/users/{user_id}", json=data)
    print(f"Update User Response: {response.status_code} {response.json()}")
    assert response.status_code == 200
    assert response.json()['username'] == new_username
    assert response.json()['email'] == new_email

def test_create_transaction():
    global user_ids, transaction_ids, user_data_for_login
    print("Testing POST /transactions")
    if len(user_ids) < 2:
        test_register_user() # Register another user if needed
        test_register_user()
    
    # Ensure sender has enough points
    sender_id = user_ids[0]
    requests.put(f"{BASE_URL}/users/{sender_id}", json={"points": 100})
    
    # Get receiver username
    receiver_response = requests.get(f"{BASE_URL}/users/{user_ids[1]}")
    receiver_data = receiver_response.json()
    receiver_username = receiver_data['username']
    
    amount = random.randint(1, 50)
    data = {"senderId": sender_id, "receiverUsername": receiver_username, "amount": amount}
    response = requests.post(f"{BASE_URL}/transactions", json=data)
    print(f"Create Transaction Response: {response.status_code} {response.json()}")
    assert response.status_code == 201
    transaction_ids.append(response.json()['id'])

def test_get_transactions():
    global user_ids
    print("Testing GET /transactions")
    if not user_ids:
        test_register_user()
    
    user_id = user_ids[0]
    response = requests.get(f"{BASE_URL}/transactions?userId={user_id}")
    print(f"Get Transactions Response: {response.status_code} {response.json()}")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_poll():
    global poll_ids
    print("Testing POST /polls")
    title = generate_random_string(20)
    options = [generate_random_string(5), generate_random_string(5), generate_random_string(5)]
    data = {"title": title, "options": options}
    response = requests.post(f"{BASE_URL}/polls", json=data)
    print(f"Create Poll Response: {response.status_code} {response.json()}")
    assert response.status_code == 201
    poll_ids.append(response.json()['id'])

def test_get_polls():
    print("Testing GET /polls")
    response = requests.get(f"{BASE_URL}/polls")
    print(f"Get Polls Response: {response.status_code} {response.json()}")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_vote_poll():
    global poll_ids, user_ids
    print("Testing POST /polls/<poll_id>/vote")
    if not poll_ids:
        test_create_poll()
    if not user_ids:
        test_register_user()
    
    poll_id = poll_ids[0]
    user_id = user_ids[0]
    poll = requests.get(f"{BASE_URL}/polls/{poll_id}").json()
    option = random.choice(poll['options'])
    data = {"userId": user_id, "option": option}
    response = requests.post(f"{BASE_URL}/polls/{poll_id}/vote", json=data)
    print(f"Vote Poll Response: {response.status_code} {response.json()}")
    assert response.status_code == 200
    assert response.json()['votes'][option] > 0

def test_create_chat_message():
    global user_ids, chat_ids
    print("Testing POST /chats")
    if not user_ids:
        test_register_user()
    
    room_id = generate_random_string(8)
    user_id = user_ids[0]
    message = generate_random_string(50)
    data = {"roomId": room_id, "userId": user_id, "message": message}
    response = requests.post(f"{BASE_URL}/chats", json=data)
    print(f"Create Chat Message Response: {response.status_code} {response.json()}")
    assert response.status_code == 201
    chat_ids.append(response.json()['id'])

def test_get_chats():
    print("Testing GET /chats")
    response = requests.get(f"{BASE_URL}/chats")
    print(f"Get Chats Response: {response.status_code} {response.json()}")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_save_analysis_history():
    global analysis_history_ids
    print("Testing POST /analysis-history")
    text = generate_random_string(100)
    sentiment = random.choice(["positive", "negative", "neutral"])
    confidence = round(random.uniform(0.1, 0.9), 2)
    score = round(random.uniform(-1.0, 1.0), 2)
    timestamp = datetime.datetime.utcnow().isoformat() + "Z"
    data = {"text": text, "sentiment": sentiment, "confidence": confidence, "score": score, "timestamp": timestamp}
    response = requests.post(f"{BASE_URL}/analysis-history", json=data)
    print(f"Save Analysis History Response: {response.status_code} {response.json()}")
    assert response.status_code == 201
    analysis_history_ids.append(response.json()['id'])

def test_get_analysis_history():
    print("Testing GET /analysis-history")
    response = requests.get(f"{BASE_URL}/analysis-history")
    print(f"Get Analysis History Response: {response.status_code} {response.json()}")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_clear_analysis_history():
    print("Testing DELETE /analysis-history")
    response = requests.delete(f"{BASE_URL}/analysis-history")
    print(f"Clear Analysis History Response: {response.status_code} {response.json()}")
    assert response.status_code == 200
    assert response.json()['message'] == 'Analysis history cleared'

def test_get_all_transactions():
    print("Testing GET /analytics/transactions")
    response = requests.get(f"{BASE_URL}/analytics/transactions")
    print(f"Get All Transactions Response: {response.status_code} {response.json()}")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_logout_user():
    print("Testing POST /auth/logout")
    response = requests.post(f"{BASE_URL}/auth/logout")
    print(f"Logout Response: {response.status_code} {response.json()}")
    assert response.status_code == 200
    assert response.json()['message'] == 'Logged out successfully'

if __name__ == "__main__":
    print("Starting backend tests...")
    test_register_user()
    test_login_user()
    test_get_users()
    test_get_user_by_id()
    test_update_user()
    test_create_transaction()
    test_get_transactions()
    test_create_poll()
    test_get_polls()
    test_vote_poll()
    test_create_chat_message()
    test_get_chats()
    test_save_analysis_history()
    test_get_analysis_history()
    test_get_all_transactions()
    test_clear_analysis_history()
    test_logout_user()
    print("All backend tests completed.")