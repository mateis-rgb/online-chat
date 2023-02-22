const alert = document.querySelector("#alerts");

function sleep (ms) {
    new Promise((resolve) => setTimeout(resolve, ms));
}


const friendList = document.querySelector('#friendsList');
const searchFriend = document.querySelector("#searchFriend");

const friends = [
    { name: "John Doe 3", isFriend: false },
    { name: "John Doe 0", isFriend: true },
    { name: "John Doe 4", isFriend: false },
    { name: "John Doe 1", isFriend: true },
    { name: "John Doe 2", isFriend: true },
];

/**
 * 
 * @param {Object} friendList 
 * @param {Element} friendListElement 
 * @param {String} searchText 
 */
function loadFriendListWithSearch (friendList, friendListElement, searchText) {
    friendListElement.innerHTML = "";

    friendList.forEach((element) => {
        if (element.name.includes(searchText)) {   
            let elm = document.createElement("div");
            
            if (element.isFriend) {   
                elm.classList = "list-group-item list-group-item-action px-3 border-0 d-flex align-items-center";
                elm.innerHTML = `<div class="p-2 flex-grow-1">
                    ${element.name}
                </div>
                <div class="p-2">
                    <button class="btn btn-primary">
                        <i class="fa-regular fa-message"></i>
                    </button>
                </div>`;
            }
            else {
                elm.classList = "list-group-item list-group-item-action px-3 border-0 d-flex align-items-center";
                elm.innerHTML = `<div class="p-2 flex-grow-1">
                    ${element.name}
                </div>
                <div class="p-2">
                    <button class="btn btn-success">
                        <i class="fa-solid fa-add"></i>
                    </button>
                    <button class="btn btn-danger" hidden>
                        <i class="fa-regular fa-circle-xmark"></i>
                    </button>
                </div>`;
            }

            friendListElement.appendChild(elm);
        }
    });
}

loadFriendListWithSearch(friends, friendList, searchFriend.value);

searchFriend.addEventListener("change", (e) => {
    e.preventDefault();
    
    loadFriendListWithSearch(friends, friendList, searchFriend.value);
});


const authSection = document.querySelector("#authSection");

if (sessionStorage.session) {
    const session = JSON.parse(sessionStorage.session);

    authSection.innerHTML = `<li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-mdb-toggle="dropdown" aria-expanded="false">
            ${session.name}
        </a>
        <ul class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
            <li>
                <button class="dropdown-item btn btn-text shadow-0" id="profileModal">Profile</button>
            </li>
            <li>
                <button class="dropdown-item btn btn-text shadow-0" id="friendRequestsModal">Demandes d'amis</button>
            </li>
            <li>
                <button class="dropdown-item btn btn-text shadow-0" id="settingsModal">Paramètres</button>
            </li>
            <li>
                <button class="dropdown-item btn btn-text shadow-0" id="logoutButton">Se déconnecter</button>
            </li>
        </ul>
    </li>`;
}
else {
    authSection.innerHTML = `<button type="button" class="btn btn-link px-3 me-2" data-mdb-toggle="modal" data-mdb-target="#loginModal">
        S'identifier
    </button>
    <button type="button" class="btn btn-link me-3" data-mdb-toggle="modal" data-mdb-target="#registerModal">
        S'enregistrer
    </button>`;
}

const loginForm = document.querySelector("#loginForm");
const loginEmail = document.querySelector("#loginEmail");
const loginPassword = document.querySelector("#loginPassword");

const registerForm = document.querySelector("#registerForm");
const registerUsername = document.querySelector("#registerUsername");
const registerEmail = document.querySelector("#registerEmail");
const registerPassword = document.querySelector("#registerPassword");


loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!sessionStorage.session) {
        login (loginEmail.value, loginPassword.value);
    }
});

registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!sessionStorage.session) {
        register (registerUsername.value, registerEmail.value, registerPassword.value);
    }
});


const logoutButton = document.querySelector("#logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", () => logout());
}

async function getAllUsers () {
    const response = await fetch("http://localhost:5050/friends/allUsers");
    const data = await response.json();

    return data;
}

async function getFriendListOfUser (userId) {
    const response = await fetch(`http://localhost:5050/friends/${userId}`);
    const data = await response.json();

    return data;
}

async function register (name, email, password) {
    const response = await fetch(`http://localhost:5050/auth/register`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            email: email,
            password: password
        })
    });
    const data = await response.json();

    if (data.status < 200 || data.status > 299) {
        alerts.firstElementChild.classList.add("alert-danger");
        alerts.firstElementChild.textContent = data.message;
        
        return;
    }
    sessionStorage.setItem("session", JSON.stringify(data.with.user));

    alerts.firstElementChild.classList.add("alert-success");
    alerts.firstElementChild.textContent = data.message;
    return;
}

async function login (email, password) {
    const response = await fetch(`http://localhost:5050/auth/login`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    });
    const data = await response.json();

    if (data.status < 200 || data.status > 299) {
        alerts.firstElementChild.classList.add("alert-danger");
        alerts.firstElementChild.textContent = data.message;
        
        return;
    }
    sessionStorage.setItem("session", JSON.stringify(data.with.user));

    alerts.firstElementChild.classList.add("alert-success");
    alerts.firstElementChild.textContent = data.message;
    return;
}

function logout () {
    if (sessionStorage.session) {
        sessionStorage.removeItem("session");
    }
}
