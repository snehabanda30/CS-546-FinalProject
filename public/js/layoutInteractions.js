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
  console.log("Hello");
  // Collect form data
  const searchTerm = $("#search_task").val().trim();
  
  if (!searchTerm) {
    alert("Please enter a search term");
    return;
  }

  window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
  
});




