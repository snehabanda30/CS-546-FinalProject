$("#logoutButton").on("click", () => {
  const requestConfig = {
    method: "POST",
    url: "/users/logout",
    success: function () {
      window.location.reload();
    },
  };
  $.ajax(requestConfig);
});

$("#favoriteButton").on("click", () => {
  const favoritedUsername = $("#username").data("username");
  const requestConfig = {
    method: "POST",
    url: "/users/favorite",
    contentType: "application/json",
    data: JSON.stringify({ favoritedUsername }),
    success: function () {
      window.location.reload();
    },
    error: function (xhr) {
      $("#toast-alert").addClass("alert-error");
      $("#alert-text").text(xhr.responseJSON.error);
      $("#toast").removeClass("hidden");
      setTimeout(() => {
        $("#toast").addClass("hidden");
      }, 4000);
    },
  };
  $.ajax(requestConfig);
});

$("#search").on("submit", (event) => {
  event.preventDefault();

  // Collect form data
  const searchTerm = $("#search_task").val().trim();
  
    // Submit form with AJAX if validation passes
  const requestConfig = {
      method: "GET",
      url: "/search", // The route for creating the post
      contentType: "application/json",
      data: {q: searchTerm},
      success: function (result) {
        // Handle error response
        $("#searchResults").html(result);
        console.log("ajax called");
      },
      error: function (xhr) {
        // Redirect on success
        console.error(xhr.responseText);
        alert("Error fetching search results");
      },
  };
    $.ajax(requestConfig);
  
});




