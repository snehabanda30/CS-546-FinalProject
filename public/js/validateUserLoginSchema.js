const userSchema = Zod.object({
  username: Zod.string()
    .min(3, "Username must be at least 3 characters")
    .max(13, "Username must be no more than 13 characters"),
  password: Zod.string().min(6, "Password must be at least 6 characters"),
});

$("#loginForm").on("submit", (event) => {
  event.preventDefault();
  $("#inputErrors").addClass("hidden").empty();
  const userInput = {
    username: $("#username").val().trim(),
    password: $("#password").val().trim(),
  };
  const result = userSchema.safeParse(userInput);
  if (result.success === false) {
    result.error.errors.forEach((error) => {
      $("#inputErrors").append(`<li>${error.message}</li>`);
    });
    $("#inputErrors").removeClass("hidden");
  } else {
    // Submit form with AJAX
    const requestConfig = {
      method: "POST",
      url: "/users/login",
      contentType: "application/json",
      data: JSON.stringify({
        username: userInput.username,
        password: userInput.password,
      }),
      error: function (xhr, status, error) {
        $("#inputErrors").append(`<li>${xhr.responseJSON.error}</li>`);
        $("#inputErrors").removeClass("hidden");
      },
      success: function (result, status, xhr) {
        window.location.href = "/";
      },
    };
    $.ajax(requestConfig);
  }
});
