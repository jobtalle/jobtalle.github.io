function cubicNoiseDrawRendering() {
	var canvas = document.getElementById("cubic-noise-renderer");
	var context = canvas.getContext("2d");
	var width = 150;
	var height = 60;
	var message = "Rendering...";
	
	context.fillStyle = "#ffffff";
	context.fillRect((canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
	
	context.strokeStyle = "#000000";
	context.beginPath();
	context.lineWidth = "1";
	context.lineCap = "butt";
	context.rect((canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
	context.stroke();
	
	context.fillStyle = "#000000";
	context.font = "18px Calibri";
	context.fillText(message,
		(canvas.width - context.measureText(message).width) / 2,
		(canvas.height + 9) / 2);
}

function cubicNoiseRender() {
	cubicNoiseDrawRendering();
	
	setTimeout(function() {
		var canvas = document.getElementById("cubic-noise-renderer");
		var context = canvas.getContext("2d");
		
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		const seed = parseFloat(document.getElementById("cubic-noise-seed").value);
		const quality = parseFloat(1 << (5 - document.getElementById("cubic-noise-quality").value));
		const octaves = parseFloat(document.getElementById("cubic-noise-octaves").value);
		const falloff = parseFloat(document.getElementById("cubic-noise-falloff").value);
		
		var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
		var period = parseFloat(document.getElementById("cubic-noise-period").value) / quality;
		var amplitude;
		
		if(falloff - 1 == 0)
			amplitude = (1 / octaves) / falloff;
		else
			amplitude = (((falloff - 1) * Math.pow(falloff, octaves)) / (Math.pow(falloff, octaves) - 1)) / falloff;
		
		for(var octave = 0; octave < octaves; ++octave) {
			var config = cubicNoiseConfig(seed + octave, period / (octave + 1));
			
			for(var y = 0; y < Math.floor(canvas.height / quality); ++y) {
				for(var x = 0; x < Math.floor(canvas.width / quality); ++x) {
					const index = (x + y * canvas.width) * quality;
					var value = cubicNoiseSample(config, x, y) * 255 * amplitude;
					
					for(var yrep = 0; yrep < quality; ++yrep) {
						for(var xrep = 0; xrep < quality; ++xrep) {
							var repIndex = (index + xrep + yrep * canvas.width) * 4;
							
							imageData.data[repIndex] += value;
							imageData.data[repIndex + 1] += value;
							imageData.data[repIndex + 2] += value;
							imageData.data[repIndex + 3] = 255;
						}
					}
				}
			}
			
			period /= 2;
			amplitude /= falloff;
		}
		
		context.putImageData(imageData, 0, 0);
	}, 20);
}

function cubicNoiseInitialize() {
	document.getElementById("cubic-noise-seed").value = getRandomSeed();
}

function cubicNoiseRandomizeSeed() {
	document.getElementById("cubic-noise-seed").value = getRandomSeed();
	
	cubicNoiseRender();
}