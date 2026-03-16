from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

users = [
    {"id": 1, "name": "John", "age": 25},
    {"id": 2, "name": "Mary", "age": 28}
]

# READ
@app.route("/users", methods=["GET"])
def get_users():
    return jsonify(users)

# CREATE
@app.route("/users", methods=["POST"])
def add_user():
    data = request.json
    new_user = {
        "id": len(users) + 1,
        "name": data["name"],
        "age": data["age"]
    }
    users.append(new_user)
    return jsonify(new_user)

# UPDATE
@app.route("/users/<int:id>", methods=["PUT"])
def update_user(id):
    data = request.json
    for user in users:
        if user["id"] == id:
            user["name"] = data["name"]
            user["age"] = data["age"]
            return jsonify(user)

# DELETE
@app.route("/users/<int:id>", methods=["DELETE"])
def delete_user(id):
    global users
    users = [u for u in users if u["id"] != id]
    return jsonify({"message": "Deleted"})

if __name__ == "__main__":
    app.run(debug=True)