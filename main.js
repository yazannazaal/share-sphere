

// Pagination Procces
let currentPage = 1;
let lastPage = 50;
let htmlContentComments = ''
window.addEventListener("scroll",function(){
  let endOfPage = window.innerHeight + window.pageYOffset >= document.body.offsetHeight;
  //To increase the performance of the projct I put the lastPage
  // a value that can decleared and don't take it from the API becasue the pages inside is greater that 1000
  if(endOfPage && currentPage<lastPage){
    currentPage = currentPage+1;
    showPosts(false,currentPage)
   
  }
})
// Pagination Procces

 function showPosts(clearPage = true, pageNumber = 1) {
  loaderShow(true)
  axios.get(`https://tarmeezacademy.com/api/v1/posts?limit=2&page=${pageNumber}`)
    .then((response) => {
      loaderShow(false)
      const posts = response.data.data;
      let parentDiv = document.getElementById("posts");

      if (clearPage) {
        parentDiv.innerHTML = "";
      }

      for (let post of posts) {

        let htmlContent = `
          <div class="card my-5 shadow">
              <div class="card-header">
                <span  style="cursor:pointer;" onclick="profilePage(${post.author.id})">
                  <img src="${post.author.profile_image}" style="width: 40px; height: 40px; border-radius: 50%;">
                  <b>${post.author.username}</b>
                </span>
                <p style="margin-left:40px">${post.created_at}</p>
              </div>
              <div class="card-body">
                  <h6 class="card-text">${post.body}</h6>
                  <img class="mb-3" src="${post.image}" style="width:90%;height: 400px;">
                  <hr>
                  <div class="d-flex justify-content-center"> 
                      <button type="button" class="btn btn-outline-dark mx-5" onclick="commentAction(${post.id})">
                        <i class="fas fa-comment"></i>Comment(${post.comments_count})
                      </button>
                      <button type="button" class="btn btn-outline-dark mx-5" onclick="shareAction(this)">
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
showPosts()

removeLogSignBtns()
function verifyLogin(){
    let userNameInputModal = document.getElementById("userNameInputModal").value;
    let passwordInputModal = document.getElementById("passwordInputModal").value;
    axios.post("https://tarmeezacademy.com/api/v1/login",{
        "username":userNameInputModal,
        "password":passwordInputModal
    })
    .then((response)=>{
        localStorage.setItem("token",response.data.token);
        localStorage.setItem("user",JSON.stringify(response.data.user));

        // closing the Modal after login
        const closeModal = document.getElementById("loginModal");
        const modalInstance = bootstrap.Modal.getInstance(closeModal);
        modalInstance.hide()
        successfulProcces('Login successful!','success','alertLogin')
        window.location.href = "home.html";
        removeLogSignBtns()
       
    })
    .catch((error)=>{
      const errorMessage = error.response.data.message;
      successfulProcces(errorMessage,'danger','alertLogin')
    })
}



function successfulProcces(message,action,id) {
   let alertID = document.getElementById(id);
    

    const appendAlert = (message, type) => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
      ].join('');
  
      alertID.appendChild(wrapper);
     
    };
  
    // Call appendAlert with your success message
    appendAlert(message, action);
  }



  function removeLogSignBtns(){
    //This function will work when the user enters the home page
    let logInDiv = document.getElementById("logInDiv");
    let logOutDiv = document.getElementById("logOutDiv"); 
    let userImageElement =  document.getElementById("userImage");
    if (localStorage.length > 0){
        let user = getUserInfo()
        document.getElementById("userNameInNav").innerHTML = user.username;
        if(user.profile_image){
          userImageElement.src = user.profile_image;
        }

        const token = localStorage.getItem("token");
            logInDiv.style.setProperty("display","none","important")
            logOutDiv.style.setProperty("display","flex","important")
        }else{
        logInDiv.style.setProperty("display","flex","important")
        logOutDiv.style.setProperty("display","none","important")
    }
  
  }
 
  function getUserInfo(){
    let cuurentUser = localStorage.getItem("user");
    let returnedUser = null;
    if(cuurentUser !== null){
       returnedUser =JSON.parse(cuurentUser)
    }
      return returnedUser;
  }


  function logOut(){
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "index.html"
    removeLogSignBtns();
  }



  function verifySignup(){
    let signUpuserNameInputModal = document.getElementById("signUpuserNameInputModal").value;
    let signUpNameInputModal = document.getElementById("signUpNameInputModal").value;
    let signUppasswordInputModal = document.getElementById("signUppasswordInputModal").value;
    let signupImageInputModal = document.getElementById("signupImageInputModal").files[0];

    let dataSent = new FormData();
    dataSent.append("username",signUpuserNameInputModal);
    dataSent.append("password",signUppasswordInputModal);
    dataSent.append("name",signUpNameInputModal);
    if (signupImageInputModal) {
      dataSent.append("image", signupImageInputModal);
    }

    const headersSent = {
      "Content-Type":"multipart/form-data",
    }

    axios.post("https://tarmeezacademy.com/api/v1/register",dataSent,{
      headers:headersSent
    }
  )
  .then((response)=>{
    localStorage.setItem("token",response.data.token);
    localStorage.setItem("user",JSON.stringify(response.data.user));
    // close the signup modal
    const closeModal = document.getElementById("SignUpModal");
    const modalInstance = bootstrap.Modal.getInstance(closeModal);
    modalInstance.hide()
    successfulProcces('Signup successful!','success','alertSignup')
    window.location.href = "home.html";
    removeLogSignBtns()
  }).catch((error)=>{
    const errorMessage = error.response.data.message;
    successfulProcces(errorMessage,'danger','alertSignup')
  })
  }


  function createNewPost(){
    const body = document.getElementById("createPostInput").value;
    const token = localStorage.getItem("token");
    const postImage = document.getElementById("createPostImage").files[0];

    let dataSent = new FormData();
    dataSent.append("body",body);
    if(postImage){
      dataSent.append("image",postImage);
    }

    const headersSent = {
      "Content-Type":"multipart/form-data",
      "authorization": `Bearer ${token} `
    }
    loaderShow(true)
    axios.post("https://tarmeezacademy.com/api/v1/posts",dataSent,{
      headers:headersSent
    })
    .then((response)=>{
      loaderShow(false)
      successfulProcces('Published','success','createPostAlert')
      const closeModal = document.getElementById("createPostModal");
      const modalInstance = bootstrap.Modal.getInstance(closeModal);
      modalInstance.hide()
      showPosts()
    })
    .catch((error)=>{
      const errorMessage = error.response.data.message;
      successfulProcces(errorMessage,'danger','createPostAlert')
    })
  

  }

  function newsFeed(){
    window.location.reload();
    showPosts()
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
    loaderShow(true)
    axios.post(`https://tarmeezacademy.com/api/v1/posts/${id}/comments`, params ,{
      headers :{
        "authorization": `Bearer ${token} `
      }
    }) 
    .then((response)=>{
      loaderShow(false)
     console.log(response);
     showPosts()
    })
    })  
}



function profilePage(id){
  window.location = `profile.html?userID=${id}`
}


function getthisUerID(){
  let cuurentUser = getUserInfo()
  profilePage(cuurentUser.id);
}

function loaderShow(show = true){
  let loaderStyle = document.getElementById("loader").style;
  show ? loaderStyle.visibility = 'visible' : loaderStyle.visibility = 'hidden';
}

 



  