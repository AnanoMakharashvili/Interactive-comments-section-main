fetch("./data.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    displayComments(data.comments);
  })
  .catch((error) => console.error("Error fetching JSON:", error));

function markup(id, picture, name, time, text, score, replyingTo) {
  let modifiedText = text;

  if (replyingTo && modifiedText.includes(`@${replyingTo}`)) {
    const regex = new RegExp(`@${replyingTo}\\b\\s*`);
    modifiedText = modifiedText.replace(regex, "").trim();
  }

  modifiedText = modifiedText.replace(
    /@(\w+)/g,
    '<span class="username">@$1</span>'
  );

  const replyText = replyingTo
    ? `<span class="replyingTo">@${replyingTo}</span> `
    : "";
  const youTag = name === "juliusomo" ? '<span class="you-tag">you</span>' : "";
  const isOwnComment = name === "juliusomo";

  return `
     <div id="message-${id}" class="message-section">
        <div class="plus-minus-style-second">
          <img onclick="plusScore(event)" alt="plus" class="plus-minus-icons plus" src="./assets/icon-plus.svg" />
          <span class="score" id="score-1">${score}</span>
          <img id="minus-${id}" onclick="minusScore(event)" alt="minus" class="plus-minus-icons minus" src="./assets/icon-minus.svg" />
        </div>
        <div class="header">
          <div class="message-header">
            <img alt="${name}" class="picture-styles" src="${picture}">
            <h1 class="Name-styles">${name} ${youTag}</h1>
            <span class="text-style">${time}</span>
          </div>
          <p class="text-style comment-content">${replyText}${modifiedText}</p>
        </div>
        <div class="message-footer">
          <div class="plus-minus-style">
            <img id="plus-${id}" onclick="plusScore(event)" alt="plus" class="plus-minus-icons plus" src="./assets/icon-plus.svg" />
            <span class="score">${score}</span>
            <img onclick="minusScore(event)" alt="minus" class="plus-minus-icons minus" src="./assets/icon-minus.svg" />
          </div>
          <div class="reply-section">
            ${
              isOwnComment
                ? `
                  <button onclick="openUpdateSection(${id})" class="edit-button" type="button">
                    <img class="reply-img-style" alt="edit" src="./assets/icon-edit.svg" />
                    <span class="reply-section">Edit</span>
                  </button>
                  <button onclick="deleteComment(${id})" class="edit-button delete-button" type="button">
                    <img class="reply-img-style" alt="delete" src="./assets/icon-delete.svg" />
                    <span class="delete-section" id="delete-span-${id}">Delete</span>
                  </button>
                `
                : `
                  <button onclick="openReplySection(event, ${id})" class="edit-button" type="button">
                    <img class="reply-img-style" alt="reply" src="./assets/icon-reply.svg" />
                    <span class="reply-section">Reply</span>
                  </button>
                `
            }
          </div>
        </div>
      </div>
    `;
}

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
          reply.score,
          reply.replyingTo
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

const voteStates = {};

function plusScore(event) {
  const commentEl = event.target.closest(".message-section");
  const id = commentEl.id;

  const scoreEls = commentEl.querySelectorAll(".score");
  let score = parseInt(scoreEls[0].textContent);

  if (voteStates[id] === "up") {
    score -= 1;
    voteStates[id] = null;
  } else {
    if (voteStates[id] === "down") {
      score += 2;
    } else {
      score += 1;
    }
    voteStates[id] = "up";
  }

  scoreEls.forEach((el) => (el.textContent = score));
}

function minusScore(event) {
  const commentEl = event.target.closest(".message-section");
  const id = commentEl.id;

  const scoreEls = commentEl.querySelectorAll(".score");
  let score = parseInt(scoreEls[0].textContent);

  if (voteStates[id] === "down") {
    score += 1;
    voteStates[id] = null;
  } else {
    if (voteStates[id] === "up") {
      score -= 2;
    } else {
      score -= 1;
    }
    voteStates[id] = "down";
  }

  scoreEls.forEach((el) => (el.textContent = score));
}

function openReplySection(event, parentId) {
  const parentEl = document.getElementById(parentId);

  const existing = parentEl.querySelector(".reply-box");
  if (existing) {
    existing.remove();
    return;
  }

  const replyBox = document.createElement("div");
  replyBox.className = "reply-box";
  replyBox.innerHTML = `
    <input type="text" class="reply-input" placeholder="Write a reply..." />
    <button class="reply-button" onclick="submitReply(${parentId})">Reply</button>
  `;

  parentEl.appendChild(replyBox);
}

function submitReply(parentId) {
  const parentEl = document.getElementById(parentId);
  const input = parentEl.querySelector(".reply-input");
  const content = input.value.trim();

  if (content === "") return;

  const id = Date.now();
  const picture = "./assets/image-juliusomo.png";
  const name = "juliusomo";
  const time = "Just now";
  const score = 0;
  const replyingTo = parentEl.querySelector(".Name-styles").textContent.trim();

  const replyHTML = markup(
    id,
    picture,
    name,
    time,
    `@${replyingTo} ${content}`,
    score,
    replyingTo
  );
  parentEl.insertAdjacentHTML("afterend", replyHTML);

  input.value = "";
  parentEl.querySelector(".reply-box").remove();
}

function openUpdateSection(commentId) {
  const commentEl = document.getElementById(`message-${commentId}`);
  const contentP = commentEl.querySelector(".comment-content");

  if (commentEl.querySelector(".update-button")) return;

  contentP.contentEditable = true;
  contentP.focus();

  const updateBtn = document.createElement("button");
  updateBtn.className = "update-button";
  updateBtn.textContent = "UPDATE";
  updateBtn.style.marginTop = "8px";

  contentP.parentNode.appendChild(updateBtn);

  updateBtn.onclick = function () {
    const newText = contentP.textContent.trim();
    if (newText !== "") {
      contentP.innerHTML = newText.replace(
        /@(\w+)/g,
        '<span class="username">@$1</span>'
      );
      contentP.contentEditable = false;
      updateBtn.remove();
    }
  };

  contentP.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      updateBtn.click();
    }
  });
}

function deleteComment(commentId) {
  commentToDelete = document.getElementById(`message-${commentId}`);
  commentEl.remove();
}

const time = new Date().toLocaleString("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  day: "numeric",
  month: "short",
});

let commentToDelete = null;

function deleteComment(commentId) {
  commentToDelete = document.getElementById(`message-${commentId}`);
  showDeleteModal();
}

function showDeleteModal() {
  const modal = document.createElement("div");
  modal.id = "deleteModal";
  modal.className = "modal-overlay";
  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";

  modalContent.innerHTML = `
      <h1 class="modal-title">Delete comment</h1>
<p class="modal-message">
  Are you sure you want to delete this comment? This will remove the comment and can’t be undone.
</p>
<div class="modal-buttons">
  <button id="cancelDelete" class="modal-button cancel-button">NO, CANCEL</button>
  <button id="confirmDelete" class="modal-button delete-button">YES, DELETE</button>
</div>
    `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  document.getElementById("cancelDelete").addEventListener("click", () => {
    modal.remove();
    commentToDelete = null;
  });

  document.getElementById("confirmDelete").addEventListener("click", () => {
    if (commentToDelete) {
      commentToDelete.remove();
      commentToDelete = null;
    }
    modal.remove();
  });
}

function openReplySection(event, parentId) {
  const replyBoxId = `reply-box-${parentId}`;
  const existing = document.getElementById(replyBoxId);
  if (existing) {
    existing.remove();
    return;
  }

  const parentEl = document.getElementById(`message-${parentId}`);

  const replyBox = document.createElement("div");
  replyBox.className = "reply-box";
  replyBox.id = replyBoxId;
  replyBox.innerHTML = `
      <img class="reply-avatar" src="./assets/image-juliusomo.png" alt="juliusomo">
      <textarea class="reply-input" placeholder="Write a reply..."></textarea>
      <button class="reply-button" onclick="submitReply(${parentId})">REPLY</button>
    `;

  parentEl.insertAdjacentElement("afterend", replyBox);
}

const messageId = `message-${commentId}`;

if (messageId === "message-3" || messageId === "message-4") {
  replyBox.querySelector(".reply-input").style.width = "642px";
}
