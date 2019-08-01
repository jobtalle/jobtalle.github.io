var currentIndex = 0;

function loadMore() {
	var request = new XMLHttpRequest();

	request.open("GET", "index" + ++currentIndex + ".html", true);
	request.onloadend = function() {
		if (request.status >= 200 && request.status < 400) {
			document.getElementById("content").innerHTML += request.responseText;

			if (currentIndex + 1 === indices)
				document.getElementById("load-more").innerHTML = "";
		}
	};

	request.send();
}