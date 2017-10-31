function getRandomSeed() {
	return Math.round(4294967295 * Math.random());
}

terrainTriggered = false;
noiseTriggered = false;

function triggerRenderers() {
	if(!noiseTriggered && document.getElementById("cubic-noise-renderer").getBoundingClientRect().top < window.innerHeight) {
		document.getElementById("cubic-noise-generate").click();
		noiseTriggered = true;
	}
	
	if(!terrainTriggered && document.getElementById("terrain-renderer").getBoundingClientRect().top < window.innerHeight) {
		document.getElementById("terrain-generate").click();
		terrainTriggered = true;
	}
}

window.onload = function() {
	triggerRenderers();
}

window.onscroll = function() {
	triggerRenderers();
}