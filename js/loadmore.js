currentIndex = 1;

function loadMore() {
	var request = new XMLHttpRequest();
	request.open("GET", "index" + currentIndex++ + ".html", true);
	request.onload = function() {
		if(request.status >= 200 && request.status < 400) {
			document.getElementById("content").appendChild(request.responseText);
			alert(request.responseText);
		}
	}
	
	request.send();
}