const commentSchema = Zod.object({
  content: Zod.string().min(1, "Comment cannot be empty"),
  postId: Zod.string().min(1, "Post ID is required"),
});

$(document).ready(() => {
  // comment submission
  $("#commentForm").on("submit", (event) => {
    event.preventDefault();
    $("#commentErrors").addClass("hidden").empty();

    // get form data
    const commentInput = {
      commentText: $("#commentContent").val().trim(),
      postId: $("#postId").val().trim(),
    };

    // validate input using Zod
    const result = commentSchema.safeParse(commentInput);
    if (result.success === false) {
      // display validation errors
      result.error.errors.forEach((error) => {
        $("#commentErrors").append(<li>${error.message}</li>);
      });
      $("#commentErrors").removeClass("hidden");
    } else {
      // post comment with AJAX if validation passes
      const requestConfig = {
        method: "POST",
        url: "/posts/${commentInput.postId}/comments",
        contentType: "application/json",
        data: JSON.stringify(commentInput),
        error: function (xhr, status, error) {
          // error response
          $("#commentErrors").append(
            <li>${xhr.responseJSON.error || "Error submitting comment"}</li>,
          );
          $("#commentErrors").removeClass("hidden");
        },
        success: function (result, status, xhr) {
          // wipe the input and refresh the comments list
          $("#commentContent").val("");
          loadComments(commentInput.postId);
        },
      };
      $.ajax(requestConfig);
    }
  });

  // Function to load and display comments for a post
  function loadComments(postId) {
    const requestConfig = {
      method: "GET",
      url: "/posts/${postId}/comments",
      success: function (result, status, xhr) {
        // clear and update the comments section
        $("#commentsList").empty();
        result.comments.forEach((comment) => {
          $("#commentsList").append(
            <li>
              <strong>${comment.username}</strong>: ${comment.commentText}
            </li>,
          );
        });
      },
      error: function (xhr, status, error) {
        // error while loading comments
        $("#commentsList").append("<li>Error loading comments.</li>");
      },
    };
    $.ajax(requestConfig);
  }

  // load comments for the post
  const postId = $("#postId").val().trim();
  loadComments(postId);
});
