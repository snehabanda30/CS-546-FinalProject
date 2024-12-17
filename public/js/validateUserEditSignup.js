$("#editForm").on("submit", (event) => {
  event.preventDefault();
  $("#inputErrors").addClass("hidden").empty();
  const userInput = {
    username: $("#username").val().trim(),
    password: $("#password").val().trim(),
  };
  // const result = edituserSchema.safeParse(userInput);
  // console.log(result);
  // if (result.success === false) {
  //   result.error.errors.forEach((error) => {
  //     $("#inputErrors").append(`<li>${error.message}</li>`);
  //   });
  //   $("#inputErrors").removeClass("hidden");
  //   return;
  // }
  const dataToSend = {};

  if (userInput.username) {
    dataToSend.username = userInput.username;
  }
  if (userInput.password) {
    dataToSend.password = userInput.password;
  }

  if (Object.keys(dataToSend).length === 0) {
    $("#inputErrors")
      .append("<li>Please provide at least one field to update.</li>")
      .removeClass("hidden");
    return;
  }
  // Submit form with AJAX
  const requestConfig = {
    method: "PATCH",
    url: "/users/editsignup",
    contentType: "application/json",
    data: JSON.stringify(dataToSend),
    error: function (xhr, status, error) {
      $("#inputErrors").append(`<li>${xhr.responseJSON.error}</li>`);
      $("#inputErrors").removeClass("hidden");
    },
    success: function (result, status, xhr) {
      window.location.href = "/";
    },
  };

  $.ajax(requestConfig);
});
