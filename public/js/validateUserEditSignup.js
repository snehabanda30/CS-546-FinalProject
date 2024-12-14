const edituserSchema = Zod.object({
  username: Zod.string()
    .min(3, "Username must be at least 3 characters")
    .max(13, "Username must be no more than 13 characters")
    .optional()
    .or(Zod.literal("")),
  password: Zod.string()
    .min(6, "Password must be at least 6 characters.")
    .nullable()
    .optional()
    .or(Zod.literal("")),
});

$("#editForm").on("submit", (event) => {
  event.preventDefault();
  $("#inputErrors").addClass("hidden").empty();
  const userInput = {
    username: $("#username").val().trim(),
    password: $("#password").val().trim(),
  };
  const result = edituserSchema.safeParse(userInput);
  if (result.success === false) {
    result.error.errors.forEach((error) => {
      $("#inputErrors").append(`<li>${error.message}</li>`);
    });
    $("#inputErrors").removeClass("hidden");
    return;
  }
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
