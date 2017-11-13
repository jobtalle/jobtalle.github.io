function preset() {
	var value = document.getElementById("l-preset").value;
	
	switch(value) {
		case "l-preset-koch-snowflake":
			setParameters(
				"A++A++A",
				"60",
				"",
				"4",
				[
					"A=A-A++A-A"
				]);
			break;
		case "l-preset-sierpinski-arrowhead-curve":
			setParameters(
				"A",
				"60",
				"",
				"6",
				[
					"A=B-A-B",
					"B=A+B+A"
				]);
			break;
		case "l-preset-plant-2":
			setParameters(
				"A[+A]BA[-A]",
				"33",
				"",
				"7",
				[
					"A=AXIOM",
					"BA=BBA",
					"BB=BBB"
				]);
			break;
		case "l-preset-plant":
			setParameters(
				"B[+A][-A]BA",
				"26",
				"",
				"7",
				[
					"A=AXIOM",
					"B=BB"
				]);
			break;
		case "l-preset-hilbert-curve":
			setParameters(
				"A",
				"90",
				"AB",
				"5",
				[
					"A=-BC+ACA+CB-",
					"B=+AC-BCB-CA+"
				]);
			break;
		case "l-preset-mosaic":
			setParameters(
				"A-A-A-A",
				"90",
				"",
				"3",
				[
					"A=AA-A+A-A-AA"
				]);
			break;
		case "l-preset-squares-fractal":
			setParameters(
				"A+A+A-A-A",
				"90",
				"",
				"4",
				[
					"A=AXIOM"
				]);
			break;
		case "l-gosper-curve":
			setParameters(
				"A",
				"60",
				"",
				"4",
				[
					"A=A-B--B+A++AA+B-",
					"B=+A-BB--B-A++A+B"
				]);
			break;
	}
}