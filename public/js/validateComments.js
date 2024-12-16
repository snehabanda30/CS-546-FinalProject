const commentSchema = Zod.object({
  commentText: Zod.string()
    .min(1, { message: "Comment cannot be empty" })
    .max(500, {
      message: "Comment cannot exceed 500 characters",
    }),
});

$("#commentForm").on("submit", (event) => {
  event.preventDefault();
  $("#commentErrors").empty().addClass("hidden");
  const commentText = $("textarea[name='commentText']").val().trim();

  const result = commentSchema.safeParse({ commentText });
  if (result.success === false) {
    result.error.errors.forEach((error) => {
      $("#commentErrors").append(`<li>${error.message}</li>`);
    });
    $("#commentErrors").removeClass("hidden");
  } else {
    const postId = window.location.pathname.split("/")[2];
    const requestConfig = {
      method: "POST",
      url: `/posts/${postId}/comments`,
      contentType: "application/json",
      data: JSON.stringify({ commentText }),
      error: function (xhr) {
        $("#commentErrors").append(
          `<li class="break-all">${xhr.responseJSON.error}</li>`,
        );
        $("#commentErrors").removeClass("hidden");
      },
      success: function () {
        window.location.reload(); // Reload to show the new comment
      },
    };
    $.ajax(requestConfig);
  }
});
