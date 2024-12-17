const userSchema = Zod.object({
  username: Zod.string()
    .min(3, "Username must be at least 3 characters")
    .max(13, "Username must be no more than 13 characters")
    .regex(/^\S+$/, "Username cannot contain spaces"),
  password: Zod.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/^\S+$/, "Password cannot contain spaces"),
  confirmPassword: Zod.string().min(
    6,
    "Confirmed password must be at least 6 characters",
  ),
  email: Zod.string().email("Invalid email address"),
  firstName: Zod.string().min(1, "First name must be at least 1 character"),
  lastName: Zod.string().min(1, "Last name must be at least 1 character"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

$("#signupForm").on("submit", (event) => {
  event.preventDefault();
  $("#inputErrors").addClass("hidden").empty();
  $(".inputField").removeClass("border-2 border-red-500 bg-red-200");
  const userInput = {
    username: $("#username").val().trim(),
    password: $("#password").val().trim(),
    firstName: $("#firstName").val().trim(),
    lastName: $("#lastName").val().trim(),
    email: $("#email").val().trim(),
    confirmPassword: $("#confirmPassword").val().trim(),
  };
  const result = userSchema.safeParse(userInput);
  if (result.success === false) {
    result.error.errors.forEach((error) => {
      $("#inputErrors").append(`<li>${error.message}</li>`);
      $(`#${error.path}`).addClass("border-2 border-red-500 bg-red-200");
    });
    $("#inputErrors").removeClass("hidden");
  } else {
    // Submit form with AJAX
    const requestConfig = {
      method: "POST",
      url: "/users/signup",
      contentType: "application/json",
      data: JSON.stringify({
        username: userInput.username,
        password: userInput.password,
        firstName: userInput.firstName,
        lastName: userInput.lastName,
        email: userInput.email,
        confirmPassword: userInput.confirmPassword,
      }),
      error: function (xhr, status, error) {
        $("#inputErrors").append(`<li>${xhr.responseJSON.error}</li>`);
        $("#inputErrors").removeClass("hidden");
      },
      success: function (result, status, xhr) {
        window.location.href = "/users/login";
      },
    };
    $.ajax(requestConfig);
  }
});
