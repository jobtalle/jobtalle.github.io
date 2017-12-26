var result = 2017;
var currentYear = new Date().getFullYear();

if(currentYear > result)
	result += " - " + currentYear;

document.getElementById("footer").innerHTML += result;