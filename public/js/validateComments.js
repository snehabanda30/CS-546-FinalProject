const commentSchema = Zod.object({
  commentText: Zod.string()
    .min(1, { message: "Comment cannot be empty" })
    .max(50, {
      message: "Comment cannot exceed 50 characters",
    }),
});

$("#post-comment").on("click", (e) => {
  e.preventDefault();
  $("#inputErrors").addClass("hidden").empty();
  $("#success-message").addClass("hidden").text("");
  const commentText = $("textarea[name='commentText']").val().trim();

  const result = commentSchema.safeParse({ commentText });
  if (result.success === false) {
    result.error.errors.forEach((error) => {
      $("#inputErrors").append(`<li>${error.message}</li>`);
    });
    $("#inputErrors").removeClass("hidden");
  } else {
    const postId = window.location.pathname.split("/")[2];
    const requestConfig = {
      method: "POST",
      url: `/posts/${postId}/comments`,
      contentType: "application/json",
      data: JSON.stringify({ commentText }),
      error: function (xhr) {
        $("#inputErrors").append(
          `<li class="break-all">${xhr.responseJSON.error}</li>`,
        );
        $("#inputErrors").removeClass("hidden");
      },
      success: function () {
        window.location.reload(); // Reload to show the new comment
      },
    };
    $.ajax(requestConfig);
  }
});
