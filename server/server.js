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
// function getFriends () {}
// function addFriend () {}
// function delFriend () {}

// function parseUsersToFriendFormat (userList, friendList) {}

// function getMessages () {}
// function addMessage () {}
// function delMessage () {}

// function login () {}
// function logout () {}
// function register () {}