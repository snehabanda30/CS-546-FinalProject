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

$("#offer-help").on("click", (e) => {
  $("success-message").addClass("hidden").text("");
  $("#inputErrors").addClass("hidden").empty();
  const postID = $(e.currentTarget).data("post-id");
  const requestConfig = {
    method: "POST",
    url: `/posts/${postID}/send-info`,
    contentType: "application/json",
    success: function () {
      $("#success-message").text("Info sent successfully!");
    },
    error: function (xhr) {
      $("#inputErrors").append(`<li>${xhr.responseJSON.error}</li>`);
      $("#inputErrors").removeClass("hidden");
    },
  };
  $.ajax(requestConfig);
});

$("#select-helper").on("click", (e) => {
  const postID = $(e.currentTarget).data("post-id");
  const helperID = $(e.currentTarget).data("helper-id");
  $("#inputErrors").addClass("hidden").empty();
  $(`#success-message-${helperID}`).addClass("hidden").text("");
  const requestConfig = {
    method: "PATCH",
    url: `/posts/${postID}/select-helper/${helperID}`,
    success: function () {
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
