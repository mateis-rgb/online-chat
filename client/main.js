const alert = document.querySelector("#alerts");

function sleep (ms) {
    new Promise((resolve) => setTimeout(resolve, ms));
}


const friend_list = document.querySelector('#friends-list');
const search_friend = document.querySelector("#search-friend");

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

loadFriendListWithSearch(friends, friend_list, search_friend.value);

search_friend.addEventListener("change", (e) => {
    e.preventDefault();
    
    loadFriendListWithSearch(friends, friend_list, search_friend.value);
});


const loginForm = document.querySelector("#loginForm");
const loginEmail = document.querySelector("#loginEmail");
const loginPassword = document.querySelector("#loginPassword");

const registerForm = document.querySelector("#registerForm");
const registerUsername = document.querySelector("#registerUsername");
const registerEmail = document.querySelector("#registerEmail");
const registerPassword = document.querySelector("#registerPassword");


loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    login (loginEmail.value, loginPassword.value);
});




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

    return data;
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

    console.log(data);

    if (data.status == "200") {
        alerts.firstElementChild.classList.add("alert-success");
        alerts.firstElementChild.textContent = data.message;
    }
    else {
        alerts.firstElementChild.classList.add("alert-danger");
        alerts.firstElementChild.textContent = data.message;
    }
    alerts.hidden = false;
    await sleep(5000);
    alerts.hidden = true;
}