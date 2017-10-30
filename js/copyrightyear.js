window.onload = function() {
	var startYear = 2017;
	var currentYear = new Date().getFullYear();
	var result = startYear;
	
	if(currentYear > startYear)
		result += " - " + currentYear;
	
	document.getElementById("footer").innerHTML += result;
}