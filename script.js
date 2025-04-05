fetch("./data.json")
  .then((response) => {
    console.log("Response status:", response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => console.log("Data loaded:", data))
  .catch((error) => console.error("Error fetching JSON:", error));

function markup(id, picture, name, time, text, score, replyingTo) {
  const modifiedText = text.replace(
    /@(\w+)/g,
    '<span class="username">@$1</span>'
  );

  const replyText = replyingTo
    ? `<span class="replyingTo">@${replyingTo}</span>: `
    : "";

  const youTag = name === "juliusomo" ? '<span class="you-tag">you</span>' : "";

  return `
      <div id="${id}" class="message-section">
        <div class="plus-minus-style-second">
          <img onclick="plusScore(event)" alt="plus" class="plus-minus-icons plus" src="./assets/icon-plus.svg" />
          <span class="score">${score}</span>
          <img onclick="minusScore(event)" alt="minus" class="plus-minus-icons minus" src="./assets/icon-minus.svg" />
        </div>
        <div class="header">
          <div class="message-header">
            <img alt="${name}" class="picture-styles" src="${picture}">
            <h1 class="Name-styles">${name} ${youTag}</h1>
            <span class="text-style">${time}</span>
          </div>
          <p class="text-style">
            ${replyText}${modifiedText}
          </p>
        </div>
        <div class="message-footer">
          <div class="plus-minus-style">
            <img onclick="plusScore(event)" alt="plus" class="plus-minus-icons plus" src="./assets/icon-plus.svg" />
            <span class="score">${score}</span>
            <img onclick="minusScore(event)" alt="minus" class="plus-minus-icons minus" src="./assets/icon-minus.svg" />
          </div>
          <div class="reply-section">
            <button onclick="openReplySection(event, ${id})" class="edit-button" type="button">
              <img class="reply-img-style" alt="reply" src="./assets/icon-reply.svg" />
            </button>
            <button onclick="openReplySection(event, ${id})" class="edit-button" type="button">
              <span class="reply-section">Reply</span>
            </button>
          </div>
        </div>
      </div>
    `;
}

fetch("./data.json")
  .then((response) => {
    console.log("Response status:", response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    console.log("Data loaded:", data);
    displayComments(data.comments);
  })
  .catch((error) => console.error("Error fetching JSON:", error));

function displayComments(comments) {
  const container = document.createElement("div");
  container.id = "comments-container";

  comments.forEach((comment) => {
    const commentHTML = markup(
      comment.id,
      comment.user.image.png,
      comment.user.username,
      comment.createdAt,
      comment.content,
      comment.score
    );
    container.innerHTML += commentHTML;

    if (comment.replies.length > 0) {
      comment.replies.forEach((reply) => {
        const replyHTML = markup(
          reply.id,
          reply.user.image.png,
          reply.user.username,
          reply.createdAt,
          `@${reply.replyingTo} ${reply.content}`,
          reply.score
        );
        container.innerHTML += replyHTML;
      });
    }
  });

  document.body.appendChild(container);

  const commentBox = document.createElement("div");
  commentBox.className = "comment-box";
  commentBox.innerHTML = `
   
    <input type="text" id="commentInput" placeholder="Add a comment..." />
    <button id="send-button" onclick="addComment()">SEND</button>
     <img class="comment-avatar" src="./assets/image-juliusomo.png" alt="user" />
  `;
  document.body.appendChild(commentBox);
}

function addComment() {
  const commentInput = document.getElementById("commentInput");
  const newComment = commentInput.value.trim();
  if (newComment !== "") {
    console.log("New comment:", newComment);
    commentInput.value = "";
  }
}

function addComment() {
  const commentInput = document.getElementById("commentInput");
  const newComment = commentInput.value.trim();

  if (newComment !== "") {
    const commentsContainer = document.getElementById("comments-container");

    const id = Date.now();
    const picture = "./assets/image-juliusomo.png";
    const name = "juliusomo";
    const time = "Just now";
    const score = 0;
    const replyingTo = null;

    const commentHTML = markup(
      id,
      picture,
      name,
      time,
      newComment,
      score,
      replyingTo
    );

    commentsContainer.innerHTML += commentHTML;
    commentInput.value = "";
  }
}
