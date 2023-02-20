const express = require("express");
const crypto = require("node:crypto");
const fs = require("fs");

const app = express();

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
        res.status(200).send({
            "userWrite": "success"
        })
    });
});





// ROUTES
app.get("/", (req, res) => {
    res.status(200);
});


app.get("/friends/")

app.listen(5050, () => {
    console.log("Chat application is listening at http://localhost:5050");
});

// function getAllUsers () {

// }
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