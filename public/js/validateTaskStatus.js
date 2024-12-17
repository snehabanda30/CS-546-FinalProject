const taskSchema = Zod.object({
  status: Zod.enum(
    ["Pending", "In Progress", "Completed"],
    "Priority must be Low, Medium, or High",
  ),
});

$("#taskstatusform").on("submit", (event) => {
  event.preventDefault();
  $("#inputErrors").addClass("hidden").empty();
  const statusInput = {
    status: $("#taskStatus").val().trim(),
  };
  const result = taskSchema.safeParse(statusInput);
  if (result.success === false) {
    result.error.errors.forEach((error) => {
      $("#inputErrors").append(`<li>${error.message}</li>`);
    });
    $("#inputErrors").removeClass("hidden");
    return;
  }

  if (Object.keys(statusInput).length === 0) {
    $("#inputErrors")
      .append("<li>Please provide at least one field to update.</li>")
      .removeClass("hidden");
    return;
  }
  // Submit form with AJAX
  const username = window.location.pathname.split("/")[4];
  const postId = window.location.pathname.split("/")[5];

  // console.log(req.session.profile.username);
  console.log("Status Input:", statusInput);
  const requestConfig = {
    method: "PATCH",
    url: `/users/profile/taskstatus/${username}/${postId}`,
    contentType: "application/json",
    data: JSON.stringify(statusInput),
    error: function (xhr, status, error) {
      console.log(xhr);
      try {
        const errorResponse = JSON.parse(xhr.responseText);
        $("#inputErrors").append(
          `<li>${errorResponse.error || "Unknown error occurred"}</li>`,
        );
        console.log(errorResponse);
      } catch (e) {
        $("#inputErrors").append(
          `<li>An unexpected error occurred: ${xhr.statusText}</li>`,
        );
      }
      $("#inputErrors").removeClass("hidden");
    },
    success: function (result, status, xhr) {
      window.location.href = `/users/profile/${username}`;
    },
  };

  $.ajax(requestConfig);
});
