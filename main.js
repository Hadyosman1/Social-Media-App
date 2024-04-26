let Status = "home";

function handleLodaer (loaderStatus = "hide") {
  const loaderContainer = document.querySelector('.loader-container');

  if (loaderStatus == "hide") {
    loaderContainer.classList.add('reset-lodaer-transform');
  } else  {
    loaderContainer.classList.remove('reset-lodaer-transform');
  }

}
handleLodaer('hide');

function handlePagination(metaData) {
  function scrollListener() {
    if (
      window.scrollY + window.innerHeight > document.body.scrollHeight - 1200 &&
      window.scrollY + window.innerHeight < document.body.scrollHeight - 100 &&
      metaData.current_page <= metaData.last_page &&
      Status == "home"
    ) {
      getALlPosts(metaData.current_page + 1);

      window.removeEventListener("scroll", scrollListener);
    }
  }

  window.addEventListener("scroll", scrollListener);
}

async function getALlPosts(currentPage = 1) {
  handleLodaer('show');
  try {
    let response = await fetch(
      `https://tarmeezacademy.com/api/v1/posts?limit=20&page=${currentPage}`
    );
    let json = await response.json();

    if (response.ok) {
      if (currentPage == 1) {
        listPosts(json, true);
        chekerLogged();
        handlePostEdit();
      } else {
        listPosts(json);
        chekerLogged();
        handlePostEdit();
      }

      handlePagination(json.meta);
    } else {
      throw `error` + json;
    }
  } catch (error) {
    console.log(error);
  } finally {
    handleLodaer('hide');
  }
}
getALlPosts();

function listPosts(json, clear = false) {
  let postsData = json.data;
  const postsWrapper = document.querySelector("#postsWrapper");

  if (clear) {
    postsWrapper.innerHTML = "";
  }

  postsData.forEach((post) => {
    if (
      !JSON.stringify(post).includes("script") &&
      !JSON.stringify(post).includes("alert")
    ) {
      postsWrapper.innerHTML += `
    <div  class="card my-4 shadow-sm">
      <div class="mt-3 d-flex align-items-center">
        <span 
          class="click-to-user-page"
          style="cursor: pointer;" 
          onclick="handleProfilePage(${post.author.id})"
        >
          <img
            src="${
              typeof post.author.profile_image !== "object"
                ? post.author.profile_image
                : "./images/anonymous-user.jpg"
            }"
            alt="Profile"
            class="Profile-img ms-3 "
          />
          <span class="ms-2 align-middle fs-4 fw-bold">@${
            post.author.username
          }</span>
        </span>
        <div 
        data-current-post-id="${post.id}" 
        data-current-post-title="${post.title}" 
        data-current-post-body="${post.body}"  
        data-author-id='${
          post.author.id
        }' class="px-3 align-items-center editBtn" style="flex-grow:1; display:flex; justify-content:end; ">
        
        <button class="btn btn-sm btn-primary">
          edit
          <i class="fa-solid fa-pen-clip" style="color: #d4d6d8;"></i>
        </button>
        
        <button class="mx-1 btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#deletePostModal">
          delete
          <i class="fa-regular fa-trash-can" style="color: #d4d6d8;"></i>
        </button>

        </div>
      </div>
      <hr />
      <div title='single post page'
       onclick="postDetailsReq(${post.id})"
       class="d-flex justify-content-center"
       style="background: #F1F1F1">
          <img
              src="${post.image}"
              class="  card-img-top rounded-3 ${
                typeof post.image !== "object" ? "" : "d-none"
              }"
              style="max-height: 370px; max-width: 98%; object-fit: contain; cursor:pointer;"
          />
      </div>    
      <div class="card-body">
        <h6 onclick="postDetailsReq(${
          post.id
        })" title='single post page' style='cursor:pointer;' class="card-title text-black-50">${
        post.created_at
      }</h6>
        <h4 style='cursor:pointer;' onclick="postDetailsReq(${post.id})" >${
        post.title || ""
      }</h4>
        <p onclick="postDetailsReq(${
          post.id
        })" style='cursor:pointer;' class="card-text">
          ${post.body}
        </p>
        <hr />
        <div>
          <i class="fa-solid fa-pen fa-flip-horizontal text-black-50"></i>
          <span>${post.comments_count} comments</span>
        </div>
      </div>
    </div>
    `;
    }
  });
}

const btnSubmitLogin = document.getElementById("submitLogin");
const btnSubmitRegister = document.getElementById("submitRegister");

async function loginReq(username, password) {

  let data = {
    username: username,
    password: password,
  };

  handleLodaer('show');
  try {
    let response = await fetch("https://tarmeezacademy.com/api/v1/login", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    let json = await response.json();

    if (json.token) {
      const closeLoginModal = document.getElementById("closeLoginModal");
      closeLoginModal.click();
      localStorage.setItem("token", json.token);
      localStorage.setItem("user", JSON.stringify(json.user));
      alertComponent("you logged in successfully 👌", "success");
      chekerLogged();
    } else {
      throw json.message;
    }
  } catch (error) {
    alertComponent(error + "⚠️", "warning");
  } finally {
    handleLodaer('hide');
  }
}

btnSubmitLogin.addEventListener("click", () => {
  const username = document.getElementById("loginUser").value;
  const password = document.getElementById("loginPassword").value;
  loginReq(username, password);
});

async function registerReq(name, email, username, pass, profileImg) {
  let formData = new FormData();
  formData.append("username", username);
  formData.append("password", pass);
  if (profileImg.length > 0) {
    formData.append("image", profileImg[0]);
  }
  formData.append("name", name);
  formData.append("email", email);
  console.log(formData);

  handleLodaer('show');
  try {
    let response = await fetch("https://tarmeezacademy.com/api/v1/register", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });
    let json = await response.json();

    if (json.token) {
      const closeRegisterModal = document.getElementById("closeRegisterModal");
      closeRegisterModal.click();
      localStorage.setItem("token", json.token);
      localStorage.setItem("user", JSON.stringify(json.user));
      alertComponent("you registered successfully 👌", "success");
      chekerLogged();
    } else {
      console.log(json, json.message);
      throw json.message;
    }
  } catch (error) {
    alertComponent(error + "⚠️", "warning");
  } finally {
    handleLodaer('hide');
  }
}

btnSubmitRegister.addEventListener("click", () => {
  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const username = document.getElementById("registerUserName").value;
  const pass = document.getElementById("registerPass").value;
  const profileImg = document.getElementById("registerImg").files;

  registerReq(name, email, username, pass, profileImg);
});

function chekerLogged() {
  const loginAndRegister = document.getElementById("loginAndRegister");
  const addPostBtn = document.querySelector('[title="add post"]');
  const checkIfUser = document.getElementById("checkIfUser");
  const addCommentBtn = document.getElementById("sendCommentInput");
  const profileLink = document.getElementById("profileLink");

  if (localStorage.getItem("token")) {
    loginAndRegister.style.display = "none";
    document.getElementById("logout").classList.add("show");
    addPostBtn.classList.remove("d-none");
    checkIfUser.classList.remove("d-none");
    addProfilePicAndName();
    addCommentBtn?.classList.remove("d-none");
    handleEditBtn();
    handleDeletePost();
    profileLink.classList.remove('d-none');
  } else {
    loginAndRegister.style.display = "block";
    document.getElementById("logout").classList.remove("show");
    addPostBtn.classList.add("d-none");
    checkIfUser.classList.add("d-none");
    addCommentBtn?.classList.add("d-none");
    handleEditBtn();
    handleDeletePost();
    profileLink.classList.add('d-none');
  }
}
chekerLogged();

function handleEditBtn() {
  let editBtns = document.querySelectorAll("[data-author-id]");
  editBtns.forEach((btn) => {
    btn.classList.add("d-none");
  });

  let user = JSON.parse(localStorage.getItem("user"));
  let userEditBtns = document.querySelectorAll(
    `[data-author-id='${user?.id}']`
  );

  userEditBtns.forEach((btn) => {
    btn.classList.remove("d-none");
    btn.children[0].setAttribute("data-edit-click", "true");

    //handle Delete Post
    btn.children[1].setAttribute("data-delete-click", "true");
  });
}

// delete post
function handleDeletePost() {
  let deleteBtns = document.querySelectorAll("[data-delete-click ='true']");

  deleteBtns.forEach((btn) => {
    let currentPostId = btn.parentElement.dataset.currentPostId;

    btn.addEventListener("click", () => {
      document
        .getElementById("acceptDelete")
        .setAttribute("data-delete-id", currentPostId);

      AcceptDeleteReq();
    });
  });
}

function AcceptDeleteReq() {
  document.getElementById("acceptDelete").addEventListener("click", () => {
    let postId = document.getElementById("acceptDelete").dataset.deleteId;
    deleteReq(postId);
  });
}

async function deleteReq(postId) {
  let token = localStorage.getItem("token");

  handleLodaer('show');
  try {
    let response = await fetch(
      `https://tarmeezacademy.com/api/v1/posts/${postId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    let json = await response.json();

    if (json.message) {
      throw json.message;
    } else {
      document.getElementById("closeDeleteModal").click();
      alertComponent("Deleted successfully 👌", "success");
    }

    if (Status !== "home") {
      switchPages("home");
      getALlPosts(1);
    } else {
      getALlPosts(1);
    }
  } catch (error) {
    alertComponent(`${error} ⚠️`, "warning");
  } finally {
    handleLodaer('hide');
  }
}

// edit post

function handlePostEdit() {
  let editBtns = document.querySelectorAll("[data-edit-click ='true']");

  editBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      let currentPostId = btn.parentElement.dataset.currentPostId;
      let currentPostTitle = btn.parentElement.dataset.currentPostTitle;
      let currentPostBody = btn.parentElement.dataset.currentPostBody;

      document
        .getElementById("submitCreatePost")
        .setAttribute("data-current-post-id", currentPostId);
      showEditModal(currentPostTitle, currentPostBody);
    });
  });
}

function showEditModal(postTitle, postBody) {
  document.getElementById("addPost").click();
  document.getElementById("PostModalTile").innerHTML = "Edit Post";
  document.getElementById("submitCreatePost").innerHTML = "Edit";
  document.getElementById("postTitle").value = postTitle;
  document.getElementById("postBody").innerHTML = postBody;
}

// Reset add Post Modal info

document.getElementById("addPost").addEventListener("click", () => {
  document.getElementById("PostModalTile").innerHTML = "Create a new post";
  document.getElementById("submitCreatePost").innerHTML = "Create";
  document.getElementById("postTitle").value = "";
  document.getElementById("postBody").innerHTML = "";
});

function addProfilePicAndName() {
  const userNameToShow = document.getElementById("userName");
  const profileImgToShow = document.getElementById("profileImg");
  const userInfo = JSON.parse(localStorage.getItem("user"));

  userNameToShow.innerHTML = userInfo.username;

  if (typeof userInfo.profile_image != "object") {
    profileImgToShow.src = userInfo.profile_image;
  }
}

function logOut() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  chekerLogged();
  alertComponent("you logged out successfully 🤝", "success");
}
document.getElementById("logout").addEventListener("click", logOut);

function alertComponent(Content, color) {
  const alertPlaceholder = document.getElementById("liveAlertPlaceholder");

  const appendAlert = (message, type) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible" role="alert">`,
      `   <div>${message}</div>`,
      '   <button id="closeAlert" type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      "</div>",
    ].join("");

    alertPlaceholder.append(wrapper);
  };

  appendAlert(Content, color);

  setTimeout(() => {
    document.getElementById("closeAlert").click();
  }, 5000);
}

async function createPostReq(title, body, imgs) {
  let submitPostStatus = document
    .getElementById("submitCreatePost")
    .innerHTML.trim();
  let token = localStorage.getItem("token");

  let formData = new FormData();
  formData.append("title", title);
  formData.append("body", body);

  if (imgs.length > 0) {
    formData.append("image", imgs[0]);
  }

  if (submitPostStatus == "Create") {

    handleLodaer('show');
    try {
      let response = await fetch("https://tarmeezacademy.com/api/v1/posts", {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      let data = await response.json();

      if (data.message) {
        throw data.message;
      } else {
        document.getElementById("closePostModal").click();
        alertComponent("Post Created Successfully 👌", "success");
        getALlPosts(1);
      }
    } catch (error) {
      alertComponent(`${error} 😢`, "warning");
    } finally {
      handleLodaer('hide');
    }

  } else {
    let editCurrentPostId =
      document.getElementById("submitCreatePost").dataset.currentPostId;

    formData.append("_method", "PUT");

    handleLodaer('show');
    try {
      let response = await fetch(
        `https://tarmeezacademy.com/api/v1/posts/${editCurrentPostId}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      let data = await response.json();

      if (data.message) {
        throw data.message;
      } else {
        document.getElementById("closePostModal").click();
        alertComponent("updated Post Successfully 👌", "success");

        if (Status == "home") {
          getALlPosts(1);
        } else {
          postDetailsReq(editCurrentPostId);
        }
      }
    } catch (error) {
      alertComponent(`${error} 😢`, "warning");
    } finally {
      handleLodaer('hide');
    }
  }
}

document.getElementById("submitCreatePost").addEventListener("click", () => {
  const title = document.getElementById("postTitle").value;
  const body = document.getElementById("postBody").value.trim();
  const imgs = document.getElementById("postImg").files;

  createPostReq(title, body, imgs);
});

async function postDetailsReq(postId) {
  
  handleLodaer('show');
  try {
    let response = await fetch(
      `https://tarmeezacademy.com/api/v1/posts/${postId}`
    );
    let json = await response.json();
    showPostDetails(json, postId);
    chekerLogged();
    handlePostEdit();
  } catch (error) {
    console.warn(error);
  } finally {
    handleLodaer('hide');
  }
}

function showPostDetails(postAllData, postId) {
  const onePostDetails = document.getElementById("onePostDetails");

  const postData = postAllData.data;
  const comments = postAllData.data.comments;

  onePostDetails.innerHTML = `
    <h2>${postData.author.username} 's post</h2>
    <div class="card my-4 shadow-sm">
      <div class="mt-3 d-flex align-items-center">
        <img src="${
          typeof postData.author.profile_image !== "object"
            ? postData.author.profile_image
            : "./images/anonymous-user.jpg"
        }" alt="Profile" class="Profile-img ms-3" />
        <span class="ms-2 align-middle h4">@${postData.author.username}</span>
        <div 
        data-current-post-id="${postData.id}" 
        data-current-post-title="${postData.title}" 
        data-current-post-body="${postData.body}"
        data-author-id='${
          postData.author.id
        }' class="px-3 editBtn" style="flex-grow:1; display:flex; justify-content:end;">
          
          <button class="btn btn-sm btn-primary">
            edit
            <i class="fa-solid fa-pen-clip" style="color: #d4d6d8;"></i>
          </button>

          <button class="mx-1 btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#deletePostModal">
          delete
          <i class="fa-regular fa-trash-can" style="color: #d4d6d8;"></i>
          </button>

        </div>
      </div>
      <hr />
      <div class="d-flex justify-content-center" style="background: #f1f1f1">
        <img
          class="${
            typeof postData.image !== "object" ? "" : "d-none"
          } rounded-3"
          src="${postData.image}"
          style="max-height: 370px; max-width: 98%; object-fit: contain "
          alt="Post Image"
        />
      </div>
      <div class="card-body">
        <h6 class="card-title text-black-50">${postData.created_at}</h6>
        <h4>${postData.title || ""}</h4>
        <p class="card-text">${postData.body || ""}</p>
        <hr />
        <div>
          <i class="fa-solid fa-pen fa-flip-horizontal text-black-50"></i>
          <span>${postData.comments_count} comments</span>
        </div>
      </div>

      
      <!-- comments -->
      <div id="commentsWarapper" class="px-3">

      </div>
      <div id="sendCommentInput" class="input-group px-3 mb-3 mt-2">
        <input id="commentContent" type="text" class="form-control" placeholder="Add a comment ..." aria-label="comment" aria-describedby="...">
        <button onclick="sendComment(${postId})" class="btn btn-primary" type="button">Send</button>
      </div>
      <!-- comments -->

    </div>
  `;

  comments.forEach((comment) => {
    document.getElementById("commentsWarapper").innerHTML += `
      <hr />
      <div class="border border-secondary border-opacity-25 px-2 py-2 rounded-3 shadow" style="background: #eee">
        <div class="mb-1 d-flex gap-2 align-items-center">
          <img src="${
            typeof comment.author.profile_image != "object"
              ? comment.author.profile_image
              : "./images/anonymous-user.jpg"
          }"  class="Profile-img"/>
          <span class="fs-5">@${comment.author.username}</span>
          </div>
          <p class="m-0 mt-2 w-75">
          ${comment.body}
          </p>
      </div>
    `;
  });

  switchPages("postPage");
}

function switchPages(Updatestatus) {
  const postsWrapper = document.getElementById("postsWrapper");
  const onePostDetails = document.getElementById("onePostDetails");
  const userProfilePage = document.getElementById("userProfilePage");
  const addPost = document.getElementById("addPost");
  const switchToHome = document.getElementById("switchToHome");

  //update page status
  Status = Updatestatus;

  //remove active class from all links
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });

  // select links
  const homeLink = document.getElementById("homeLink");
  const profileLink = document.getElementById("profileLink");

  if (Status == "home") {
    postsWrapper.classList.remove("d-none");
    onePostDetails.classList.add("d-none");
    userProfilePage.classList.add("d-none");
    addPost.classList.remove("d-none");
    switchToHome.classList.add("d-none");
    homeLink.classList.add("active");
  } else if (Status == "postPage") {
    postsWrapper.classList.add("d-none");
    onePostDetails.classList.remove("d-none");
    userProfilePage.classList.add("d-none");
    addPost.classList.add("d-none");
    switchToHome.classList.remove("d-none");
  } else if (Status == "userProfilePage") {
    userProfilePage.classList.remove("d-none");
    postsWrapper.classList.add("d-none");
    onePostDetails.classList.add("d-none");
    switchToHome.classList.remove("d-none");
    profileLink.classList.add("active");
  }
}

switchPages("home");

async function sendComment(postId) {
  let commentContent = document.getElementById("commentContent").value;
  let token = localStorage.getItem("token");

  if (commentContent.trim() == "") {
    alertComponent("you should send value 😉", "warning");
    return false;
  } else if (/script/gi.test(commentContent)) {
    alertComponent("you can't send : script 😠", "danger");
    return false;
  }

  handleLodaer('show');
  try {
    let response = await fetch(
      `https://tarmeezacademy.com/api/v1/posts/${postId}/comments`,
      {
        method: "POST",
        body: JSON.stringify({
          body: commentContent,
        }),
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    let json = await response.json();

    if (json.message) {
      throw json.message;
    } else {
      alertComponent("comment sent successfully 👌", "success");
      postDetailsReq(postId);
    }
  } catch (error) {
    alertComponent(`${error} 😶`, "warning");
  } finally {
    handleLodaer('hide');
  }
}

// switch to home page

document.getElementById("switchToHome").addEventListener("click", () => {
  switchPages("home");
});

// handle User Profile Page

function handleProfilePage(authorId) {
  switchPages("userProfilePage");
  const userProfilePage = document.getElementById("userProfilePage");
  let user;

  if (!authorId) {
    user = JSON.parse(localStorage.getItem("user"));
    authorId = user.id;
    createUserInfo();
    createUserPosts();
  } else {
    (async () => {
      
      handleLodaer('show');
      try {
        let response = await fetch(
          `https://tarmeezacademy.com/api/v1/users/${authorId}`
        );
        let json = await response.json();
        user = json.data;
        createUserInfo();
        createUserPosts();
      } catch (error) {
        alert(error);
      } finally {
        handleLodaer('hide');
      }
    })();
  }

  function createUserInfo() {
    userProfilePage.innerHTML = `
    <div
    class="user-info d-flex flex-wrap align-items-center justify-content-evenly gap-4 bg-light p-4 shadow rounded-3"
    >
      <div class="user-img">
        <img
          class="user-pro-pic"
          src="${
            typeof user.profile_image == "object"
              ? "./images/anonymous-user.jpg"
              : user.profile_image
          }"
          alt="user picture"
        />
      </div>
      <div class="user-details d-flex flex-column" style="flex-basis:40%;">
        <h3 class=" fw-bold fs-5">
          ${user.email || ""}
        </h3>
        <h2 class="fs-4 fw-bold">
          ${user.username || ""}
        </h2>
        <h3 class=" fw-bold fs-5">
          ${user.name || ""}
        </h3>
      </div>
      <div class="user-post-count" style="flex-basis:40%;">
      <p class="text-muted m-0">
        <span class="fs-2 fw-bold text-dark">${user.posts_count} </span>Posts
      </p>
      <p class="text-muted m-0">
        <span class="fs-2 fw-bold text-dark">${
          user.comments_count
        } </span>Comments
      </p>
      </div>
    </div>
    <h2 class="my-4 fw-bold">${user.username}'s posts</h2>
   `;
  }

  async function createUserPosts() {

    handleLodaer('show');
    try {
      let response = await fetch(
        `https://tarmeezacademy.com/api/v1/users/${authorId}/posts`
      );
      let json = await response.json();
      showData(json.data);
      chekerLogged()
      handlePostEdit();
    } catch (error) {
      alert("error");
    } finally {
      handleLodaer('hide');
    }

    function showData(posts) {
      const div = document.createElement("div");

      posts.forEach((post) => {

        if (
          JSON.stringify(post).includes("script") ||
          JSON.stringify(post).includes("alert")
        ) {
          return;
        }

        div.innerHTML += `
        <div  class="card my-4 shadow-sm">
          <div class="mt-3 d-flex align-items-center">
            <span onclick="handleProfilePage(${post.author.id})">
              <img
                src="${
                  typeof post.author.profile_image !== "object"
                    ? post.author.profile_image
                    : "./images/anonymous-user.jpg"
                }"
                alt="Profile"
                class="Profile-img ms-3 "
              />
              <span class="ms-2 align-middle fs-4 fw-bold">@${
                post.author.username
              }</span>
            </span>
            <div 
            data-current-post-id="${post.id}" 
            data-current-post-title="${post.title}" 
            data-current-post-body="${post.body}"  
            data-author-id='${
              post.author.id
            }' class="px-3 align-items-center editBtn" style="flex-grow:1; display:flex; justify-content:end; ">
            
            <button class="btn btn-sm btn-primary">
              edit
              <i class="fa-solid fa-pen-clip" style="color: #d4d6d8;"></i>
            </button>
            
            <button class="mx-1 btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#deletePostModal">
              delete
              <i class="fa-regular fa-trash-can" style="color: #d4d6d8;"></i>
            </button>
    
            </div>
          </div>
          <hr />
          <div title='single post page'
          onclick="postDetailsReq(${post.id})"
          class="d-flex justify-content-center"
          style="background: #F1F1F1">
              <img
                  src="${post.image}"
                  class="  card-img-top rounded-3 ${
                    typeof post.image !== "object" ? "" : "d-none"
                  }"
                  style="max-height: 370px; max-width: 98%; object-fit: contain; cursor:pointer;"
              />
          </div>    
          <div class="card-body">
            <h6 onclick="postDetailsReq(${
              post.id
            })" title='single post page' style='cursor:pointer;' class="card-title text-black-50">${
          post.created_at
        }</h6>
            <h4 style='cursor:pointer;' onclick="postDetailsReq(${post.id})" >${
          post.title || ""
        }</h4>
            <p onclick="postDetailsReq(${
              post.id
            })" style='cursor:pointer;' class="card-text">
              ${post.body}
            </p>
            <hr />
            <div>
              <i class="fa-solid fa-pen fa-flip-horizontal text-black-50"></i>
              <span>${post.comments_count} comments</span>
            </div>
          </div>            
        </div>
        
        `;
      });

      userProfilePage.append(div);
    }
  }
}
