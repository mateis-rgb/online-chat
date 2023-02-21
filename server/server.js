const express = require("express");
const crypto = require("node:crypto");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(bodyParser.json());

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

app.get("/friends/:uid/add/:friendUID", (req, res) => {
    const add = addFriend(parseInt(req.params.uid), parseInt(req.params.friendUID));

    res.status(add.status).send(add);
});

app.get("/friends/:uid/remove/:friendUID", (req, res) => {
	const remove = delFriend(parseInt(req.params.uid), parseInt(req.params.friendUID));

	res.status(remove.status).send(remove);
});


app.post("/auth/register", (req, res) => {
    const reg = register(req.body.name, req.body.email, req.body.password);

    res.status(reg.status).send(reg);
});

app.post("/auth/login", (req, res) => {
	const log = login(req.body.email, req.body.password);

	res.status(log.status).send(log);
});


app.listen(5050, () => {
    console.log("Chat application is listening at http://localhost:5050");
});


/**
 * Vérifie si l'adresse e-mail a un format valide
 *
 * @param {string} email - L'adresse e-mail à vérifier
 * @returns {boolean} True si l'adresse e-mail est valide, sinon False
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
}

/**
 * Vérifie si une chaîne de caractères contient des caractères malveillants
 *
 * @param {string} input - La chaîne de caractères à vérifier
 * @returns {boolean} True si la chaîne de caractères est valide, sinon False
 */
function isValidInput(input) {
    const inputRegex = /^[a-zA-Z0-9]+$/;
    
    return inputRegex.test(input);
}


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

/**
 * Ajoute un ami à la liste des amis.
 * @param {number} userId - L'ID de l'utilisateur qui veut ajouter l'ami.
 * @param {number} friendId - L'ID de l'ami à ajouter.
 * @returns {Object} - Un objet contenant un statut et un message.
 *                    - Si l'ami a été ajouté avec succès, le statut est 200 et le message est "Friend added successfully".
 *                    - Si l'ami est déjà ajouté, le statut est 500 et le message est "Friend already added".
 *                    - Si userId ou friendId ne correspondent pas à des utilisateurs référencés, le statut est 500 et le message est "Users don't exist".
 *                    - Si userId er friendId sont identiques, le statut est 500 et le message est "Both route parameter identifiers are the same".
 */
function addFriend(userId, friendId) {
    // Récupérer la liste des amis et des utilisateurs
    const friendList = getAllFriends();
    const usersList = getAllUsers();

	// Vérifier si userId est égale à friendId
	if (userId === friendId) {
		return {
			status: 500,
			message: "Both route parameter identifiers are the same"
		}
	}
  
    // Vérifier si l'ami est déjà ajouté
    const alreadyAdded = friendList.find(
        (friend) =>
            (friend.userId === userId && friend.isFriendWith === friendId) ||
            (friend.userId === friendId && friend.isFriendWith === userId)
    );
    if (alreadyAdded) {
        return {
            status: 400,
            message: 'Friend already added',
        };
    }
  
    // Vérifier si userId et friendId correspondent à des utilisateurs référencés
    const userExists = usersList.some((user) => user.id === userId);
    const friendExists = usersList.some((user) => user.id === friendId);
    if (!userExists || !friendExists) {
        return {
            status: 500,
            message: "Users don't exist",
        };
    }
  
    // Ajouter l'ami à la liste des amis
    friendList.push({
        id: friendList.length + 1,
        userId: userId,
        isFriendWith: friendId,
    });
  
    friendList.push({
        id: friendList.length + 1,
        userId: friendId,
        isFriendWith: userId,
    });
  
    // Écrire les données mises à jour dans le fichier friends.json
    fs.writeFile('friends.json', JSON.stringify(friendList, '', '\t'), (err) => {
        if (err) {
            return {
                status: 500,
                message: err,
            };
      }
    });
  
    // Retourner un objet contenant le statut et le message appropriés
    return {
        status: 200,
        message: 'Friend added successfully',
    };
}

/**
 * Supprime la relation d'amitié correspondant à userId et friendId du fichier friends.json
 * @param {number} userId - L'ID de l'utilisateur qui souhaite supprimer la relation d'amitié
 * @param {number} friendId - L'ID de l'ami à supprimer de la liste d'amis de l'utilisateur
 * @returns {object} - Un objet contenant le statut de la suppression (200 ou 500) et un message associé
 */
function delFriend(userId, friendId) {
	const friendList = getAllFriends();
  
	// Trouve l'index de la relation d'amitié correspondant à userId et friendId
	const index = friendList.findIndex(
		(friend) =>
			(friend.userId === userId && friend.isFriendWith === friendId) ||
			(friend.userId === friendId && friend.isFriendWith === userId)
	);
  
	if (index === -1) {
		return {
			status: 500,
			message: 'Friend relationship not found',
		};
	}
  
	// Supprime la relation d'amitié correspondant à userId et friendId
	friendList.splice(index, 1);
  
	// Trouve l'index de la relation d'amitié correspondant à friendId et userId
	const index2 = friendList.findIndex(
		(friend) =>
			(friend.userId === friendId && friend.isFriendWith === userId) ||
			(friend.userId === userId && friend.isFriendWith === friendId)
	);
  
	if (index2 === -1) {
		return {
			status: 500,
			message: 'Friend relationship not found',
		};
	}
  
	// Supprime la relation d'amitié correspondant à friendId et userId
	friendList.splice(index2, 1);
  
	fs.writeFile('friends.json', JSON.stringify(friendList, '', '\t'), (err) => {
		if (err) {
			return {
				status: 500,
				message: err,
			};
		}
	});
  
	return {
		status: 200,
		message: 'Friend relationship deleted successfully',
	};
}

// function getMessages () {}
// function addMessage () {}
// function delMessage () {}

/**
 * Vérifie les informations de connexion et renvoie un code de statut et un message correspondants.
 *
 * @param {string} email - L'adresse e-mail de l'utilisateur.
 * @param {string} password - Le mot de passe de l'utilisateur.
 * @returns {Object} - Un objet contenant le code de statut et le message correspondants.
 */
function login(email, password) {
    // Récupère tous les utilisateurs
    const users = getAllUsers();

    // Vérifie si l'utilisateur existe
    const user = users.find((user) => user.email === email);

    // Si l'utilisateur n'existe pas, renvoie un code de statut 401 (Non autorisé) avec un message correspondant.
    if (!user) {
        return {
			status: 401,
			message: 'Adresse e-mail ou mot de passe incorrect'
        };
    }

    // Vérifie si le mot de passe est correct
    const hashedPassword = bcrypt.hashSync(password, 10);
    if (hashedPassword !== user.password) {
        // Si le mot de passe est incorrect, renvoie un code de statut 401 (Non autorisé) avec un message correspondant.
        return {
        status: 401,
        message: 'Adresse e-mail ou mot de passe incorrect'
        };
    }

    // Si l'utilisateur existe et que le mot de passe est correct, renvoie un code de statut 200 (OK) avec un message correspondant.
    return {
        status: 200,
        message: 'Connexion réussie'
    };
}


// function logout () {}


/**
 * Enregistre un nouvel utilisateur
 *
 * @param {string} name - Le nom de l'utilisateur
 * @param {string} email - L'adresse e-mail de l'utilisateur
 * @param {string} password - Le mot de passe de l'utilisateur
 * @returns {object} Un objet contenant un code de statut et un message
 */
function register(name, email, password) {
    // Vérifier si l'adresse e-mail a un format valide
    if (!isValidEmail(email)) {
        return {
            status: 400,
            message: 'Invalid email address'
        }
    }
  
    // Vérifier que les entrées ne contiennent pas de caractères malveillants
    if (!isValidInput(name)) {
        return {
            status: 400,
            message: 'Invalid name input'
        }
    }
    if (!isValidInput(password)) {
        return {
            status: 400,
            message: 'Invalid password input'
        }
    }
  
    var users = getAllUsers();
  
    // Vérifier si il existe un utilisateur qui porte le meme email
    const emailExist = users.some((user) => user.email === email);
    if (emailExist) {
        return {
            status: 409,
            message: 'Email already exists'
        }
    }
  
    // Hacher le mot de passe avec bcrypt
    const hashedPassword = bcrypt.hashSync(password, 10);
  
    users.push({
        id: users.length + 1,
        name: name,
        email: email,
        password: hashedPassword,
        created_at: new Date().toUTCString(),
    });
  
    fs.writeFile('users.json', JSON.stringify(users, '', '\t'), (err) => {
        if (err) return {
            status: 500,
            message: err
        }
    });
  
    return {
        status: 201,
        message: "User registered successfully"
    }
}