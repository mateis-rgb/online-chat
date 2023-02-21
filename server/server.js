const express = require("express");
const crypto = require("node:crypto");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

// DEV ROUTES
app.get("/db/seed/UserTableSeeder", (req, res) => {
    var userList = Array();

    for (let i = 0; i < 10; i++) {
        userList.push({
            id: i,
            name: `John Doe ${i}`,
            email: `john${i}@doe.fr`,
            password: crypto.createHash("sha256").update("0000").digest("hex"),
            created_at: new Date().toUTCString(),
        });
    }

    var users = JSON.stringify(userList, "", "\t");

    fs.writeFileSync("users.json", users, (err) => {
        if (err) {
            res.status(500).send(err);
        }
    });

    res.status(200).send({
        userWrite: "success"
    })
});


// ROUTES
app.get("/", (req, res) => {
    res.status(200).send({
        application: "ok"
    });
});

app.get("/friends/allUsers", (req, res) => {
    const users = getAllUsers();

    if (users == null) {
        res.status(500).send({
            usersRequest: "failed",
            users: users
        });
        return;
    }

    res.status(200).send({
        usersRequest: "success",
        users: users
    });
});

app.get("/friends/:uid", (req, res) => {
    const friends = getFriendListOfUser(req.params.uid);

    if (friends == null) {
        res.status(500).send({
            friendsRequest: "failed",
            friends: friends
        });
        return;
    }

    res.status(200).send({
        friendsRequest: "success",
        friends: friends
    });
});


app.listen(5050, () => {
    console.log("Chat application is listening at http://localhost:5050");
});


function getAllUsers () {
    let users = fs.readFileSync("./users.json", "utf8", (err) => {
        if (err) {
            return null;
        }
    });

    if (users.length == 0) {
        users = null;
    }
    else {
        users = JSON.parse(users);
    }

    return users;
}

function getAllFriends () {
    let friends = fs.readFileSync("./friends.json", "utf8", (err) => {
        if (err) {
            return null;
        }
    });

    if (friends.length == 0) {
        friends = null;
    }
    else {
        friends = JSON.parse(friends);
    }

    return friends;
}

function getFriendListOfUser (userId) {
    const users = getAllUsers();
    const friends = getAllFriends();

    var friendList = Array();

    friends.forEach((user) => {
        if (user.userId == userId) {
            console.log(users[user.userId])
        
            friendList.push({
                id: user.id,
                user: users[userId],
                friend: users[user.isFriendWith]
            });
        }
    });

    return friendList;
}

function addFriend (userId, friendId) {
    
}
// function delFriend (userId, friendId) {}













// function parseUsersToFriendFormat (userList, friendList) {}

// function getMessages () {}
// function addMessage () {}
// function delMessage () {}

// function login () {}
// function logout () {}
// function register () {}