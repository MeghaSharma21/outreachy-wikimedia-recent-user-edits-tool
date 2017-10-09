/**
 * Function that fetches the recent edits by a user.
 *
 * 'encodeURIComponent' function has been used to escape unsafe characters in the URL.
 * Similarly, unsafe characters have been escaped in HTML also.
 * This will prevent injection in HTML and URL.
 */
function fetchRecentEdits() {
  //Displaying 'Fetching Results' message till the actual results get loaded.
  document.getElementById("results").innerHTML =
    "<div class='panel panel-default message'> <div class='panel-body'>Fetching Results</div></div>";
  var searchTerm = document.getElementById('search').value;
  var url = "https://en.wikipedia.org/w/api.php";
  //Ajax call that sends the query to fetch recent edits using wikipedia API
  $.ajax({
    url: url,
    type: "GET",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: {
      action: "query",
      format: "json",
      //Because of 'origin' the CORS request will succeed but will not authenticate the user.
      origin: "*",
      list: "usercontribs",
      ucprop: "ids|title|timestamp|size|parsedcomment|flags",
      ucuser: searchTerm,
      ucdir: "older",
      uclimit: "6",
    },
    headers: {
      "Api-User-Agent": "outreachy-recent-edits-tool/1.0"
    },
    success: function(data, status, jqXHR) {
      var html = "";
      if (data.error != null) {
        $('#results').empty();
        alert("Encountered an error while making request. Error:" + data.error
          .info);
        html = "<div class='panel panel-default message'> <div class='panel-body'>No results!</div></div>";
        $('#results').html(html);
      } else {
        userContributions = data.query.usercontribs;
        var diffLink, articleSize, articleSizeNumberAndUnit, articleSizeNumber, articleSizeUnit;
        for (var i = 0; i < userContributions.length; i++) {
          diffLink =
            "<a class='stat-value' href ='https://en.wikipedia.org/w/index.php?" +
            encodeURIComponent(userContributions[i].title.replace(/ /g,
              "_")) + "&oldid=" + userContributions[i].revid +
            "&diff=prev'><i class='fa fa-pencil-square-o fa-edit-icon' aria-hidden='true'></i></a>";
          articleSize = formatBytes(userContributions[i].size);
          articleSizeNumberAndUnit = articleSize.split(" ");
          articleSizeNumber = articleSizeNumberAndUnit[0];
          articleSizeUnit = articleSizeNumberAndUnit[1]
          html +=
            "<div class='wrapper inline'>" +
            "<div class='info-card pink'>" +
            "<div class='info-card__level info-card__level--pink'>" +
            userContributions[i].timestamp + "</div>" +
            "<div class='info-card__unit-name'>" + userContributions[i].title
            .replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</div>" +
            "<div class='info-card__unit-description'>" +
            "<strong>Comment: </strong>" + userContributions[i].parsedcomment +
            "</div>" +
            "<div class='info-card__unit-stats info-card__unit-stats--pink clearfix'>" +
            "<div class='one-third'>" +
            "<div class='stat'>" + diffLink + "</div>" +
            "<div class='stat-value fa-icon-name'>Diff-Link</div>" +
            "</div>" +
            "<div class='one-third'>" +
            "<div class='stat'>" + articleSizeNumber + "<sup>"+ articleSizeUnit + "</sup>" + "</div>" +
            "<div class='stat-value'>Article Size</div>" +
            "</div>" +
            "<div class='one-third'>" +
            "<div class='stat'>" + (userContributions[i].flags ==
              undefined ? "None" : (userContributions[i].flags)) +
            "</div>" +
            "<div class='stat-value'>Flags</div>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div>";
        }
        //Handling the case when there are no edits by the specified user.
        if (userContributions.length == 0) {
          html = "<div class='panel panel-default message' >" +
            "<div class='panel-body'> No recent edits by " +
            searchTerm.replace(/</g, "&lt;").replace(/>/g, "&gt;") +
            "</div></div>";
        }
        $('#results').html(html);
      }
    },
    error: function(jqXHR, textStatus, error) {
      $('#results').empty();
      formatAjaxErrorMessage(jqXHR, error);
      var html = "<div class='panel panel-default message'> <div class='panel-body'>No results!</div></div>";
      $('#results').html(html);
    }
  });
}

/**
 * Function to handle errors being thrown from an ajax call
 */
function formatAjaxErrorMessage(jqXHR, error) {
  switch (jqXHR.status) {
    case 0:
      alert("Verify your network. No connection!");
      return;

    case 500:
      alert("500 - Internal Server Error.");
      return;

    case 404:
      alert("404 - Requested page cannot be found");
      return;

    default:
      alert("Error:\n" + jqXHR.responseText);
  }
}

/*
* Function to Convert size in bytes to KB, MB, GB etc
*/
function formatBytes(bytes,decimals) {
   if(bytes == 0) return '0 Bytes';
   var k = 1024,
       dm = decimals || 1,
       sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
       i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}