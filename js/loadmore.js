currentIndex = 1;

function loadMore() {
	var nextRequest = new XMLHttpRequest();
	
	nextRequest.open("HEAD", "index" + (currentIndex + 1) + ".html", true);
	nextRequest.onloadend = function() {
		var request = new XMLHttpRequest();
		
		request.open("GET", "index" + currentIndex++ + ".html", true);
		request.onload = function() {
			if(request.status >= 200 && request.status < 400) {
				document.getElementById("content").innerHTML += request.responseText;

				if (nextRequest.status === 404)
					document.getElementById("load-more").innerHTML = "";
			}
		};

		request.send();
	};

	nextRequest.send();
}