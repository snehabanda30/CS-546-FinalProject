const skillsRegex =
  /^\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s*(?:,\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s*)*$/;

const userEditSchema = Zod.object({
  email: Zod.string().email(),

  phone: Zod.string()
    .min(10, "Phone number must be at least 10 characters")
    .max(10, "Phone number cannot exceed 10 characters"),

  firstName: Zod.string()
    .min(1, "First name must be at least 1 character")
    .max(50, "First name cannot exceed 50 characters"),

  lastName: Zod.string()
    .min(1, "Last name must be at least 1 character")
    .max(50, "Last name cannot exceed 50 characters"),

  address: Zod.string()
    .min(1, "Address must be at least 1 character")
    .max(100, "Address cannot exceed 100 characters"),

  suite: Zod.string()
    .min(1, "Suite must be at least 1 character")
    .max(50, "Suite cannot exceed 50 characters")
    .optional()
    .or(Zod.literal("")),

  city: Zod.string()
    .min(1, "City must be at least 1 character")
    .max(50, "City cannot exceed 50 characters"),

  state: Zod.string()
    .min(1, "State must be at least 1 character")
    .max(50, "State cannot exceed 50 characters"),

  zipcode: Zod.string()
    .min(5, "Zipcode must be exactly 5 characters")
    .max(5, "Zipcode must be exactly 5 characters"),

  country: Zod.string()
    .min(1, "Country must be at least 1 character")
    .max(50, "Country cannot exceed 50 characters"),

  skills: Zod.string().regex(
    skillsRegex,
    "Invalid skills format. Must be a comma-separated list of skills",
  ),
});

$("#updateProfileForm").on("submit", (event) => {
  event.preventDefault();
  $("#inputErrors").addClass("hidden").empty();
  const userInput = {
    email: $("#email").val().trim(),
    phone: $("#phone").val().trim(),
    firstName: $("#firstName").val().trim(),
    lastName: $("#lastName").val().trim(),
    address: $("#address").val().trim(),
    suite: $("#suite").val().trim(),
    city: $("#city").val().trim(),
    state: $("#state").val().trim(),
    zipcode: $("#zipcode").val().trim(),
    country: $("#country").val().trim(),
    skills: $("#skills").val().trim(),
  };
  const result = userEditSchema.safeParse(userInput);
  if (result.success === false) {
    result.error.errors.forEach((error) => {
      $("#inputErrors").append(`<li>${error.message}</li>`);
    });
    $("#inputErrors").removeClass("hidden");
  } else {
    const username = window.location.pathname.split("/")[3];
    const requestConfig = {
      method: "PUT",
      url: `/users/profile/${username}/edit`,
      contentType: "application/json",
      data: JSON.stringify({
        email: userInput.email,
        phone: userInput.phone,
        firstName: userInput.firstName,
        lastName: userInput.lastName,
        address: userInput.address,
        suite: userInput.suite,
        city: userInput.city,
        state: userInput.state,
        zipcode: userInput.zipcode,
        country: userInput.country,
        skills: userInput.skills,
      }),
      error: function (xhr, status, error) {
        $("#inputErrors").append(`<li>${xhr.responseJSON.error}</li>`);
        $("#inputErrors").removeClass("hidden");
      },
      success: function (result, status, xhr) {
        window.location.href = `/users/profile/${username}`;
      },
    };
    $.ajax(requestConfig);
  }
});
