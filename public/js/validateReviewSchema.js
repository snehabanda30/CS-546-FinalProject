const reviewSchema = Zod.object({
  rating: Zod.string(),
  reviewBody: Zod.string().optional(),
}).refine((data) => parseInt(data.rating) >= 1 && parseInt(data.rating) <= 5, {
  message: "Rating must be between 1 and 5",
});

$("#reviewForm").on("submit", (event) => {
  event.preventDefault();
  $("#inputErrors").empty().addClass("hidden");
  const rating = $("input[name='rating']:checked").val();
  const reviewBody = $("#reviewBody").val().trim();

  const result = reviewSchema.safeParse({ rating, reviewBody });
  if (result.success === false) {
    result.error.errors.forEach((error) => {
      $("#inputErrors").append(`<li>${error.message}</li>`);
    });
    $("#inputErrors").removeClass("hidden");
  } else {
    const username = window.location.pathname.split("/")[3];
    const requestConfig = {
      method: "POST",
      url: "/users/review",
      contentType: "application/json",
      data: JSON.stringify({
        rating,
        reviewBody,
        username,
      }),
      error: function (xhr) {
        $("#inputErrors").append(
          `<li class="break-all">${xhr.responseJSON.error}</li>`,
        );
        $("#inputErrors").removeClass("hidden");
      },
      success: function () {
        console.log("Review posted");
      },
    };
    $.ajax(requestConfig);
  }
});
