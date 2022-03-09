// Create variable to save current user data
let currentUserObj;

await fetch("data.json")
  .then(res => res.json())
  .then(data => {
    // Get current user data and save it in currentUserObj
    currentUserObj = data["currentUser"];
  
    // Create Main Section
    const mainSection = document.createElement("section");
    mainSection.className = "interactive-comments";
  
    // Create Container 
    const containerDiv = document.createElement("div");
    containerDiv.className = "container";
    
    // Create Comments div
    const commentsDiv = document.createElement("div");
    commentsDiv.className = "comments";
    containerDiv.append(commentsDiv);
    
    // Loop over comments array
    for (let comment of data["comments"]) {
      // Create Comment
      const commentDiv = document.createElement("div");
      commentDiv.className = "comment";
      
      // Check if comment is not made by current user
      if (comment.user.username !== data["currentUser"].username) {
        commentDiv.innerHTML = createComment(comment);
      } else {
        commentDiv.innerHTML = createCommentByCurrentUser(comment, comment["replyingTo"], comment.content);
        commentDiv.classList.add("current-user");
      }
      commentsDiv.append(commentDiv);
      
      // Create replies div
      const repliesDiv = document.createElement("div");
      repliesDiv.className = "replies";
      commentsDiv.append(repliesDiv);
      
      // Check if there are replies for comment
        // Create replies of comment
      if (comment["replies"].length !== 0) {
        // Loop over replies array
        comment["replies"].forEach(reply => {
          // Create Reply
          const replyDiv = document.createElement("div");
          replyDiv.className = "comment";
          
          // Check if Reply is not made by current user
          if (reply.user.username !== data["currentUser"].username) {
            replyDiv.innerHTML = createComment(reply);
          } else {
            replyDiv.innerHTML = createCommentByCurrentUser(reply, reply["replyingTo"], reply.content);
            replyDiv.classList.add("current-user");
          }
          repliesDiv.append(replyDiv);
        });
      }
    }
    
    // Create Add Comment Field
    const addCommentDiv = document.createElement("div");
    addCommentDiv.className = "add-comment-field";
    addCommentDiv.innerHTML = `
      <img src="${data["currentUser"].image.webp}" alt="user-img">
      <textarea class="main-textarea-field" name="addComment" placeholder="Add a comment..."></textarea>
      <button class="main-submit-btn send-btn">Send</button>`;
    containerDiv.append(addCommentDiv);
  
    // Append
    mainSection.append(containerDiv);
    document.body.prepend(mainSection);
  })
  .catch(err => console.log(err));


let newReplyingTo;

document.querySelector(".interactive-comments").addEventListener("click", function (e) {
  // When you click on add reply button, insert add reply field
  if (e.target.classList.contains("reply-btn")) {    
    // Get Replying to whom?
    newReplyingTo = e.target.previousElementSibling.children[1].textContent;
    
    // Check if there's old add reply field to remove it
    if (document.querySelector(".add-reply-field")) {
      document.querySelector(".add-reply-field").remove();
    }
    
    // Get its Grand Parent Element 
    let comment = e.target.parentElement.parentElement;
    
    // Check if comment has repliesDiv
    if (comment.nextElementSibling !== null && comment.nextElementSibling.className === "replies") {
      comment.nextElementSibling.append(addReplyField(currentUserObj));
    } else {
      comment.after(addReplyField(currentUserObj));
    }
    
    // Focus on add reply field textarea and make cursor at the end
    focusOnField(document.querySelector(".add-reply-field textarea"));
  }

  
  // When you click on send reply button
  if (e.target.classList.contains("send-reply")) {    
    // Get new content entered by current user without @username
    let newContent = e.target.previousElementSibling.value.replace("@" + newReplyingTo, "");
    
    // Check if there is new content entered by current user 
    if (newContent.trim() !== "") {
      // Create new comment Div
      let newComment = document.createElement("div");
      newComment.className = "comment current-user"
      newComment.innerHTML = createCommentByCurrentUser(currentUserObj, newReplyingTo, newContent);

      // Append new comment Div before add reply field
      document.querySelector(".add-reply-field").before(newComment);
    }
  }
  
  // When you click on send button
  if (e.target.classList.contains("send-btn")) {    
    // Get new content entered by current user
    let newContent = e.target.previousElementSibling.value;
    
    // Check if there is new content entered by current user 
    if (newContent.trim() !== "") {
      // Create new comment Div
      let newComment = document.createElement("div");
      newComment.className = "comment current-user"
      newComment.innerHTML = createCommentByCurrentUser(currentUserObj, "", newContent);

      // Append new comment Div to comments main div
      document.querySelector(".comments").append(newComment);
      
      // Empty add comment field textarea value
      document.querySelector(".add-comment-field textarea").value = "";
    }
  }
  
  // When you click on delete button
  if (e.target.className === "delete-btn") {
    // Get its Grand Parent Element 
    let commentParent = e.target.parentElement.parentElement.parentElement;
    
    // Create popup
    const popupDiv = document.createElement("div");
    popupDiv.className = "popup";
    popupDiv.innerHTML =
      `<div class="message-delete">
          <h3>Delete comment</h3>
          <p>
            Are you sure you want to delete this comment? This will remove the comment and can't be undone.
          </p>
          <button class="no">No, Cancel</button>
          <button class="yes">Yes, Delete</button>
        </div>`;
    document.body.append(popupDiv);
    
    // Add class "scroll-locked" to body
    document.body.classList.add("scroll-locked");
    
    // When click yes button, remove entire comment and popup, then remove class "scroll-locked" from body
    document.querySelector(".yes").onclick = function () {
      // Remove entire Comment
      commentParent.remove();
      // Remove popup
      popupDiv.remove();
      // Add class "scroll-locked" to body
      document.body.classList.remove("scroll-locked");
    }

    // When click no button, remove popup, then remove class "scroll-locked" from body
    document.querySelector(".no").onclick = function () {
      // Remove popup
      popupDiv.remove();
      // Add class "scroll-locked" to body
      document.body.classList.remove("scroll-locked");
    }
  }

  // When you click on edit button
  if (e.target.className === "edit-btn") {
    // add class "active" to edit button 
    e.target.classList.add("active");
    // Get content
    let content = e.target.parentElement.nextElementSibling.textContent;
    // Get editReplyingTo which is "@username"
    let editReplyingTo = content.slice(0, content.indexOf(" "));
    // Remove p content
    e.target.parentElement.nextElementSibling.remove();

    // Create textarea to contain content
    let textareaElement = document.createElement("textarea");
    textareaElement.className = "main-textarea-field";
    textareaElement.value = content;
    e.target.parentElement.after(textareaElement);
    
    // Focus on created textarea field and make cursor at the end
    focusOnField(textareaElement);
    
    // Create update button
    let updateBtn = document.createElement("button");
    updateBtn.innerHTML = "Update";
    updateBtn.className = "update-btn main-submit-btn";
    textareaElement.after(updateBtn);

    // When you click update button
    document.querySelector(".update-btn").onclick = function (e) {
      // Get edited content without @username
      let editedContent = e.target.previousElementSibling.value.replace(editReplyingTo, "");
      // Remove textarea field
      e.target.previousElementSibling.remove();
      
      // Create p content
      let editP = document.createElement("p");
      editP.className = "content";
      editP.innerHTML = `<span class="to">${editReplyingTo}</span>${editedContent}`;
      e.target.before(editP);
      
      // remove class "active" from its edit button 
      e.target.parentElement.querySelector(".edit-btn").classList.remove("active");
      
      // Remove update button
      e.target.remove();
    };
  }

  // When you click outside reply button and textarea, remove add reply field
  if (!e.target.classList.contains("reply-btn") && e.target.tagName !== "TEXTAREA") {
    // Check if there's old add reply field to remove it
    if (document.querySelector(".add-reply-field")) {
      document.querySelector(".add-reply-field").remove();
    }
  }
  
  // When you click on class "icon-plus", increase score
  if (e.target.classList.contains("icon-plus")) {
    // Increase score by one
    e.target.nextElementSibling.innerHTML++;
    // Add class "disabled" to target
    e.target.classList.add("disabled");
    // Check if there is class "disabled" for other icon, then remove it
    if (e.target.parentElement.querySelector(".icon-minus").classList.contains("disabled")) {
      e.target.parentElement.querySelector(".icon-minus").classList.remove("disabled")
    }
  }
  
  // When you click on class "icon-minus", decrease score by one
  if (e.target.classList.contains("icon-minus")) {
    // Decrease score by one
    e.target.previousElementSibling.innerHTML--;
    // Add class "disabled" to target
    e.target.classList.add("disabled");
    // Check if there is class "disabled" for other icon, then remove it
    if (e.target.parentElement.querySelector(".icon-plus").classList.contains("disabled")) {
      e.target.parentElement.querySelector(".icon-plus").classList.remove("disabled")
    }
  }
});


/* Helper Functions */

// Create Function to create comment
function createComment(value) {
  let elementInnerHTML = 
    `<div class="score">
        <svg class="icon-plus" width="11" height="11" xmlns="http://www.w3.org/2000/svg"><path d="M6.33 10.896c.137 0 .255-.05.354-.149.1-.1.149-.217.149-.354V7.004h3.315c.136 0 .254-.05.354-.149.099-.1.148-.217.148-.354V5.272a.483.483 0 0 0-.148-.354.483.483 0 0 0-.354-.149H6.833V1.4a.483.483 0 0 0-.149-.354.483.483 0 0 0-.354-.149H4.915a.483.483 0 0 0-.354.149c-.1.1-.149.217-.149.354v3.37H1.08a.483.483 0 0 0-.354.15c-.1.099-.149.217-.149.353v1.23c0 .136.05.254.149.353.1.1.217.149.354.149h3.333v3.39c0 .136.05.254.15.353.098.1.216.149.353.149H6.33Z" fill="#C5C6EF"/></svg>
        <span>${value.score}</span>
        <svg class="icon-minus" width="11" height="3" xmlns="http://www.w3.org/2000/svg"><path d="M9.256 2.66c.204 0 .38-.056.53-.167.148-.11.222-.243.222-.396V.722c0-.152-.074-.284-.223-.395a.859.859 0 0 0-.53-.167H.76a.859.859 0 0 0-.53.167C.083.437.009.57.009.722v1.375c0 .153.074.285.223.396a.859.859 0 0 0 .53.167h8.495Z" fill="#C5C6EF"/></svg>
      </div>
      <div class="description">
        <div class="user-info">
          <img src="${value.user.image.webp}" alt="user-img">
          <span class="username">${value.user.username}</span>
          <span class="createdAt">${calcaluteTime(value.createdAt)}</span>
        </div>
        <a class="reply-btn" href="#">
          <svg width="14" height="13" xmlns="http://www.w3.org/2000/svg"><path d="M.227 4.316 5.04.16a.657.657 0 0 1 1.085.497v2.189c4.392.05 7.875.93 7.875 5.093 0 1.68-1.082 3.344-2.279 4.214-.373.272-.905-.07-.767-.51 1.24-3.964-.588-5.017-4.829-5.078v2.404c0 .566-.664.86-1.085.496L.227 5.31a.657.657 0 0 1 0-.993Z" fill="#5357B6"/></svg>
          Reply
        </a>
        <p class="content">
          ${value["replyingTo"]? `<span class="to">@${value["replyingTo"]}</span>` : ''} ${value.content}
        </p>
      </div>`;
  return elementInnerHTML;
};

// Create Function to create comment by curent user
function createCommentByCurrentUser(value, replyingTo, content) {
  let elementInnerHTML = 
    `<div class="score">
        <svg class="icon-plus" width="11" height="11" xmlns="http://www.w3.org/2000/svg"><path d="M6.33 10.896c.137 0 .255-.05.354-.149.1-.1.149-.217.149-.354V7.004h3.315c.136 0 .254-.05.354-.149.099-.1.148-.217.148-.354V5.272a.483.483 0 0 0-.148-.354.483.483 0 0 0-.354-.149H6.833V1.4a.483.483 0 0 0-.149-.354.483.483 0 0 0-.354-.149H4.915a.483.483 0 0 0-.354.149c-.1.1-.149.217-.149.354v3.37H1.08a.483.483 0 0 0-.354.15c-.1.099-.149.217-.149.353v1.23c0 .136.05.254.149.353.1.1.217.149.354.149h3.333v3.39c0 .136.05.254.15.353.098.1.216.149.353.149H6.33Z" fill="#C5C6EF"/></svg>
        <span>${value.score ? value.score : 0}</span>
        <svg class="icon-minus" width="11" height="3" xmlns="http://www.w3.org/2000/svg"><path d="M9.256 2.66c.204 0 .38-.056.53-.167.148-.11.222-.243.222-.396V.722c0-.152-.074-.284-.223-.395a.859.859 0 0 0-.53-.167H.76a.859.859 0 0 0-.53.167C.083.437.009.57.009.722v1.375c0 .153.074.285.223.396a.859.859 0 0 0 .53.167h8.495Z" fill="#C5C6EF"/></svg>
      </div>
      <div class="description">
        <div class="user-info">
          <img src="${currentUserObj.image.webp}" alt="user-img">
          <span class="username">${currentUserObj.username}<span class="you">you</span></span>
          <span class="createdAt">${value.createdAt ? calcaluteTime(value.createdAt) : "few seconds"}</span>
        </div>
        <div class="control-btns">
          <a class="delete-btn" href="#">
            <svg width="12" height="14" xmlns="http://www.w3.org/2000/svg"><path d="M1.167 12.448c0 .854.7 1.552 1.555 1.552h6.222c.856 0 1.556-.698 1.556-1.552V3.5H1.167v8.948Zm10.5-11.281H8.75L7.773 0h-3.88l-.976 1.167H0v1.166h11.667V1.167Z" fill="#ED6368"/></svg>
            Delete
          </a>
          <a class="edit-btn" href="#">
            <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg"><path d="M13.479 2.872 11.08.474a1.75 1.75 0 0 0-2.327-.06L.879 8.287a1.75 1.75 0 0 0-.5 1.06l-.375 3.648a.875.875 0 0 0 .875.954h.078l3.65-.333c.399-.04.773-.216 1.058-.499l7.875-7.875a1.68 1.68 0 0 0-.061-2.371Zm-2.975 2.923L8.159 3.449 9.865 1.7l2.389 2.39-1.75 1.706Z" fill="#5357B6"/></svg>
            Edit
          </a>
        </div>
        <p class="content">${replyingTo ? `<span class="to">@${replyingTo}</span>` : ''} ${content}</p>
      </div>
    </div>`;
  return elementInnerHTML;
};

// Create fucntion to create add reply Field
function addReplyField(currentUser) {
  const addReplyDiv = document.createElement("div");
  addReplyDiv.className = "add-reply-field";
  addReplyDiv.innerHTML = `
    <img src="${currentUser.image.webp}" alt="user-img">
    <textarea class="main-textarea-field" name="addRelpy">@${newReplyingTo} </textarea>
    <button class="main-submit-btn send-reply">Relpy</button>`;
  return addReplyDiv;
}

// Create function to focus on created field and make cursor at the end of its text content
function focusOnField(fieldElement) {
  fieldElement.focus();
  fieldElement.setSelectionRange(fieldElement.value.length + 1, fieldElement.value.length + 1);
}

// Create function to calculte time units
function calcaluteTime(dateInString) {
  // Get milliSeconds from created date to now
  let diff = Date.now() - new Date(dateInString).getTime();
  
  let seconds = diff / 1000;
  let intSeconds = Math.round(seconds);
  
  let minutes = seconds / 60;
  let intMinutes = Math.round(minutes);
  
  let hours = minutes / 60;
  let intHours = Math.round(hours);
  
  let days = hours / 24;
  let intDays = Math.round(days);
  
  let weeks = days / 7;
  let intWeerks = Math.round(weeks);
  
  let months = days / 30;
  let intMonths = Math.round(months);
  
  let years = days / 365;
  let intYears = Math.round(years);
  
  if (intSeconds < 60) {
    return intSeconds > 1 ? `${intSeconds} seconds ago`: `${intSeconds} second ago`;
  } else if (intMinutes < 60) {
    return intMinutes > 1 ? `${intMinutes} minutes ago`: `${intMinutes} minute ago`;
  } else if (intHours < 24) {
    return intHours > 1 ? `${intHours} hours ago`: `${intHours} hour ago`;
  } else if (intDays < 7) {
    return intDays > 1 ? `${intDays} days ago`: `${intDays} day ago`;
  } else if (intDays < 30) {
    return intWeerks > 1 ? `${intWeerks} weeks ago`: `${intWeerks} weeks ago`;
  } else if (intDays < 365) {
    return intMonths > 1 ? `${intMonths} months ago`: `${intMonths} month ago`;
  } else {
    return intYears > 1 ? `${intYears} years ago`: `${intYears} year ago`;
  }
}
