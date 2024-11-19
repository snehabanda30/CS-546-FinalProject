const userSchema = Zod.object({
  username: Zod.string()
    .min(3, "Username must be at least 3 characters")
    .max(13, "Username must be no more than 13 characters"),
  password: Zod.string().min(6, "Password must be at least 6 characters"),
});

$("#signupForm").on("submit", (event) => {
  event.preventDefault();
  $("#zodInputErrors").addClass("hidden").empty();
  const userInput = {
    username: $("#username").val(),
    password: $("#password").val(),
  };
  const result = userSchema.safeParse(userInput);
  if (result.success === false) {
    result.error.errors.forEach((error) => {
      $("#zodInputErrors").append(`<li>${error.message}</li>`);
    });
    $("#zodInputErrors").removeClass("hidden");
  } else {
    // Submit form with AJAX
  }
});
