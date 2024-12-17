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

  const searchTerm = $("#search_task").val().trim();

  if (!searchTerm) {
    alert("Please enter a search term");
    return;
  }

  window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
});

$("#offer-help").on("click", (e) => {
  $("success-message").addClass("hidden").text("");
  $("#inputErrors").addClass("hidden").empty();
  const postID = $(e.currentTarget).data("post-id");
  const requestConfig = {
    method: "POST",
    url: `/posts/${postID}/send-info`,
    contentType: "application/json",
    success: function () {
      $("#success-message").show();
      $("#success-message").text("Info sent successfully!");
    },
    error: function (xhr) {
      $("#inputErrors").append(`<li>${xhr.responseJSON.error}</li>`);
      $("#inputErrors").removeClass("hidden");
    },
  };
  $.ajax(requestConfig);
});

$(".select-helper").on("click", (e) => {
  const postID = $(e.currentTarget).data("post-id");
  const helperID = $(e.currentTarget).data("helper-id");
  $(`#inputErrors-${helperID}`).addClass("hidden").empty();
  $(`#success-message-${helperID}`).addClass("hidden").text("");

  const requestConfig = {
    method: "PATCH",
    url: `/posts/${postID}/select-helper/${helperID}`,
    success: function () {
      $(`#success-message-${helperID}`).show();
      $(`#success-message-${helperID}`).text("Helper selected successfully!");
    },
    error: function (xhr) {
      $(`#inputErrors-${helperID}`).append(
        `<li>${xhr.responseJSON.error}</li>`,
      );
      $(`#inputErrors-${helperID}`).removeClass("hidden");
    },
  };
  $.ajax(requestConfig);
});

$(document).ready(function () {
  $('#fetch-filters').on('click', () => {
    const categoryDropdown = $('#categoryDropdown').empty().append('<option>Loading...</option>');
    const skillDropdown = $('#skillsDropdown').empty().append('<option>Loading...</option>');
    const $successMessage = $('#success-message').addClass('hidden').text('');
    const $inputErrors = $('#inputErrors').addClass('hidden').empty();

    $.ajax({
      method: 'GET',
      url: '/categories',
      success: (categories) => {
        categoryDropdown.empty().append('<option value="">Select Category</option>');
        categories.forEach(category => {
          categoryDropdown.append(`<option value="${category}">${category}</option>`);
        });
        $successMessage.text('Categories loaded successfully!').removeClass('hidden');
      },
      error: (xhr) => {
        $inputErrors
          .append('<li>Error fetching categories. Please try again.</li>')
          .removeClass('hidden');
      },
    });  
  });
});


$("#filterForm").on("submit", (event) => {
  event.preventDefault();
  //console.log("Hello");
  // Collect form data
  const selectedCategory = $("#categoryDropdown").val();
  
  if (!selectedCategory) {
    $("#inputErrors").append("<li>Please select a category to filter.</li>");
    $("#inputErrors").removeClass("hidden");
    return;
  }

 window.location.href = `/filterByCategory?category=${encodeURIComponent(selectedCategory)}`;
  
});
 
$("#endorsebutton").on("click", (event) => {
  event.preventDefault();

  const username = window.location.pathname.split("/")[3];
  window.location.href = `/users/profile/${encodeURIComponent(username)}/endorse`;

});
