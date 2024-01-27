
const urlParams = new URLSearchParams(window.location.search)
const userID = urlParams.get("userID")
showUser(userID)
  function homePage(){
    window.location = "home.html"
  }
 

  function showUser(id){
    axios.get(`https://tarmeezacademy.com/api/v1/users/${id}`)
    .then((response)=>{
       let info = response.data.data;
       document.getElementById("userFirstName").innerHTML = info.name;
       document.getElementById("userName").innerHTML = info.username;
       document.getElementById("userEmail").innerHTML = info.email;
       document.getElementById("postsCount").innerHTML = info.posts_count;
       document.getElementById("commentsCount").innerHTML = info.comments_count;
       document.getElementById("userImage").src = info.profile_image;

       showPosts(id)
    })
  }

  function showPosts(id) {
    axios.get(`https://tarmeezacademy.com/api/v1/users/${id}/posts`)
      .then((response) => {
        const posts = response.data.data;
        let parentDiv = document.getElementById("posts");
        parentDiv.innerHTML = ""
        for (let post of posts) {
            let user = getUserInfo()
            let isUserPost = user !== null && post.author.id == user.id
            console.log(isUserPost);
            let userBtnContent = ''
            if(isUserPost){
              userBtnContent = `<button onclick="editPost(${post.id},'${post.body}')" data-bs-toggle="modal" data-bs-target="#editPostModal" type="button" class="btn btn-outline-dark" style="float:right;">Edit</button>
                                <button onclick="deletePost(${post.id})"  type="button" data-bs-toggle="modal" data-bs-target="#deletePostModal" class="btn btn-outline-danger mx-2" style="float:right;">Delete</button>
              `
            
            }
          let htmlContent = `
            <div class="card my-5 shadow">
                <div class="card-header" >
                 <span>
                 <img src="${post.author.profile_image}" style="width: 40px; height: 40px; border-radius: 50%;">
                 <b>${post.author.username}</b>
                 <p style="margin-left:40px">${post.created_at}</p>
                 </span>
                    ${userBtnContent}
          

                </div>
                <div class="card-body">
                    <h6 class="card-text">${post.body}</h6>
                    <img class="mb-3" src="${post.image}" style="width:90%;height: 400px;">
                    <hr>
                    <div class="d-flex justify-content-center"> 
                        <button type="button" class="btn btn-outline-dark mx-5">
                          <i class="fas fa-heart"></i>Like(<span class="like-count"></span>)
                        </button>
                        <button type="button" class="btn btn-outline-dark mx-5" onclick="commentAction(${post.id})">
                          <i class="fas fa-comment"></i>Comment(${post.comments_count})
                        </button>
                        <button type="button" class="btn btn-outline-dark mx-5">
                          <i class="fas fa-share"></i>Share
                        </button>
                    </div>
                    <hr>
                    <div id="commentsDiv_${post.id}"></div>
                </div>
            </div>
          `;
  
          parentDiv.innerHTML += htmlContent;
        }
  
      });
  }
  
  function commentAction(id) {
    axios.get(`https://tarmeezacademy.com/api/v1/posts/${id}`)
      .then((response) => {
        const commentsParent = document.getElementById(`commentsDiv_${id}`);
        const post = response.data.data;
        const comments = post.comments;
          commentsParent.innerHTML = ""
        for (let comment of comments) {
          let htmlContent = `
            <!-- first comment -->
            <div class="p-3">
              <div>
                <img src="${comment.image}"  style="width: 40px; height: 40px; border-radius: 50%;">
                <b class="mx-2">${comment.author.username}</b>
              </div>  
              <div class="mx-4 mt-2">
                <p>${comment.body}</p>
              </div>
            </div>
            <!-- //first comment -->
          `;
          commentsParent.innerHTML += htmlContent;
        }
  
        // Add an input field for comments and a submit button
        let commentInput = document.createElement('input');
        commentInput.setAttribute('type', 'text');
        commentInput.setAttribute('placeholder', 'Write a comment');
        commentInput.setAttribute('id', `commentInput_${id}`);
        commentInput.classList.add('form-control', 'mt-3');
  
        let submitButton = document.createElement('button');
        submitButton.setAttribute('type', 'button');
        submitButton.setAttribute('id', 'sub-btn');
        submitButton.classList.add('btn', 'btn-outline-secondary', 'mt-3');
        submitButton.textContent = 'Submit';
        commentsParent.appendChild(commentInput);
        commentsParent.appendChild(submitButton);
        submitComment(id)
      });
  }
  
  function submitComment(id)
  
{
    
    let submitBtn = document.getElementById("sub-btn");
    submitBtn.addEventListener("click",function(){
    let commentValue = document.getElementById(`commentInput_${id}`).value;     
    let params = {
      "body" : commentValue
    }
    let token = localStorage.getItem("token");

    axios.post(`https://tarmeezacademy.com/api/v1/posts/${id}/comments`, params ,{
      headers :{
        "authorization": `Bearer ${token} `
      }
    }) 
    .then((response)=>{
     console.log(response);
    })
    })  
}


function editPost(postID,postBody){
    document.getElementById("editPostModal").setAttribute("data-post-id", postID);
    document.getElementById("postBody").innerHTML = postBody;
    
}
function sendEditRequist(){
    const postId = document.getElementById("editPostModal").getAttribute("data-post-id");
    const postImage = document.getElementById("editPostImage").files[0];
    const body = document.getElementById("postBody").value;
    const token = localStorage.getItem("token");
    let dataSent = new FormData();
    dataSent.append("body",body);
    dataSent.append("_method","put")
    if(postImage){
      dataSent.append("image",postImage);
    }
    const headersSent = {
      "Content-Type":"multipart/form-data",
      "authorization": `Bearer ${token} `
    }
    axios.post(`https://tarmeezacademy.com/api/v1/posts/${postId}`,dataSent,{
        headers:headersSent
    })
    .then((response)=>{
        let editedPost = response.data.data;

        const closeModal = document.getElementById("editPostModal");
        const modalInstance = bootstrap.Modal.getInstance(closeModal);
        modalInstance.hide()
        showUser(userID)
    })
}

function deletePost(postID){
  document.getElementById("deletePostModal").setAttribute("data-post-id", postID);
}

function sendDeleteRequiest(){
  const postId = document.getElementById("deletePostModal").getAttribute("data-post-id");
  const token = localStorage.getItem("token");
  const headersSent = {
    "authorization": `Bearer ${token} `
  }
  axios.delete(`https://tarmeezacademy.com/api/v1/posts/${postId}`,{
    headers:headersSent
})
.then((response)=>{
  const closeModal = document.getElementById("deletePostModal");
  const modalInstance = bootstrap.Modal.getInstance(closeModal);
  modalInstance.hide()
  showUser(userID)
})
}