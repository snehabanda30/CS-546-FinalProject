const postSchema = Zod.object({
  category: Zod.string().min(1, "Category is required"),
  location: Zod.object({
    address: Zod.string().min(1, "Address is required"),
    city: Zod.string().min(1, "City is required"),
    state: Zod.string().min(1, "State is required"),
    zipCode: Zod.string().min(1, "Zip Code is required"),
    country: Zod.string().min(1, "Country is required"),
  }),
  skillsRequired: Zod.string()
    .min(1, "Skills required field cannot be empty")
    .regex(/^[a-zA-Z, ]*$/, "Skills must be a comma-separated list of words"),
  priority: Zod.enum(
    ["Low", "Medium", "High"],
    "Priority must be Low, Medium, or High",
  ),
  description: Zod.string().min(1, "Description is required"),
  completeBy: Zod.string()
    .min(1, "Complete by date is required")
    .refine((date) => {
      const currentDate = new Date();
      const completeByDate = new Date(date);
      return completeByDate > currentDate; // Ensures date is in the future
    }, "Complete by date must be in the future"),
});

$("#createPostForm").on("submit", (event) => {
  // console.log("form submitted.");
  event.preventDefault();
  $("#inputErrors").addClass("hidden").empty();

  // Collect form data
  const postInput = {
    category: $("#category").val().trim(),
    location: {
      address: $("#address").val().trim(),
      city: $("#city").val().trim(),
      state: $("#state").val().trim(),
      zipCode: $("#zipCode").val().trim(),
      country: $("#country").val().trim(),
    },
    skillsRequired: $("#skillsRequired").val().trim(),
    priority: $("#priority").val().trim(),
    description: $("#description").val().trim(),
    completeBy: $("#completeBy").val().trim(),
  };

  console.log("Collected form data:", postInput);

  // Validate input using Zod schema
  const result = postSchema.safeParse(postInput);
  if (result.success === false) {
    console.log("failed validation.");
    // Display validation errors
    result.error.errors.forEach((error) => {
      $("#inputErrors").append(`<li>${error.message}</li>`);
    });
    $("#inputErrors").removeClass("hidden");
  } else {
    // Submit form with AJAX if validation passes
    const requestConfig = {
      method: "POST",
      url: "/posts/createPost", // The route for creating the post
      contentType: "application/json",
      data: JSON.stringify(postInput),
      error: function (xhr, status, error) {
        // Handle error response
        $("#inputErrors").append(`<li>${xhr.responseJSON.error}</li>`);
        $("#inputErrors").removeClass("hidden");
      },
      success: function (result, status, xhr) {
        // Redirect on success
        window.location.href = `/posts/post/${result._id}`; // Redirect to the newly created post's page
      },
    };
    $.ajax(requestConfig);
  }
});
