const Water = function(canvas) {
    const gridSize = 48;
    const gridColorBack = new Myr.Color(0.82, 0.75, 0.46);
    const gridColorFront = new Myr.Color(0.63, 0.6, 0.45);
    const brushRadius = 16;
    const brushSpacing = brushRadius * 0.25;
    const mousePrevious = new Myr.Vector(0, 0);
    const mouseCurrent = new Myr.Vector(0, 0);
    const myr = new Myr(canvas);
    const image = new myr.Surface(myr.getWidth(), myr.getHeight());
    const texture = new ConvTex(
        myr,
        new myr.Shader(
            "void main() {" +
                "lowp float damping = 0.997;" +
                "lowp vec4 pixel = texture(source, uv);" +
                "lowp vec4 pixelLeft = texture(source, vec2(uv.x - pixelSize.x, uv.y));" +
                "lowp vec4 pixelUp = texture(source, vec2(uv.x, uv.y - pixelSize.y));" +
                "lowp vec4 pixelRight = texture(source, vec2(uv.x + pixelSize.x, uv.y));" +
                "lowp vec4 pixelDown = texture(source, vec2(uv.x, uv.y + pixelSize.y));" +
                "color = vec4(((pixelLeft.r + pixelUp.r + pixelRight.r + pixelDown.r) / 2.0 - pixel.g) * damping, pixel.r, 0, 1);" +
            "}",
            ["source"],
            []
        ),
        myr.getWidth(),
        myr.getHeight(),
        1);

    const displacementShader = new myr.Shader(
        "lowp float get(int x, int y) {" +
            "return texture(displacement, uv + vec2(x, y) * pixelSize).r;" +
        "}" +
        "void main() {" +
            "lowp float dx = get(1, 0) - get(-1, 0);" +
            "lowp float dy = get(0, 1) - get(0, -1);" +
            "lowp vec2 displacement = vec2(dx, dy);" +
            "lowp vec2 focus = vec2(-0.1, 0.1);" +
            "lowp float shiny = max(0.0, displacement.y - displacement.x);" +
            "color = texture(source, uv + displacement * 0.1) * (1.0 + shiny);" +
        "}",
        ["source", "displacement"],
        []
    );

    let brushDown = false;

    displacementShader.setSurface("source", image);
    texture.setClearColor(new Myr.Color(0, 0, 0, 1));
    texture.getFront().bind();
    texture.getFront().clear();

    image.bind();
    image.clear();

    for (let y = 0; y < image.getHeight(); y += gridSize << 1) {
        for (let x = 0; x < image.getWidth(); x += gridSize << 1) {
            myr.primitives.fillRectangle(
                gridColorBack,
                x, y,
                gridSize * 2, gridSize * 2
            );

            myr.primitives.fillRectangle(
                gridColorFront,
                x, y,
                gridSize, gridSize
            );

            myr.primitives.fillRectangle(
                gridColorFront,
                x + gridSize, y + gridSize,
                gridSize, gridSize
            );
        }
    }

    myr.setClearColor(Myr.Color.WHITE);

    this.update = () => {
        brushed = false;
        
        texture.update();

        myr.bind();
        myr.clear();

        displacementShader.setSurface("displacement", texture.getFront());
        displacementShader.draw(0, 0);

        myr.flush();

        return true;
    };

    addMouseDown(canvas, (x, y) => {
        activate(this);

        mouseCurrent.x = x;
        mouseCurrent.y = y;

        brushDown = true;
    });

    addMouseUp(canvas, () => {
        brushDown = false;
    });

    addMouseMove(canvas, (x, y) => {
        mousePrevious.x = mouseCurrent.x;
        mousePrevious.y = mouseCurrent.y;
        mouseCurrent.x = x;
        mouseCurrent.y = y;

        if (brushDown) {
            const dx = mouseCurrent.x - mousePrevious.x;
            const dy = mouseCurrent.y - mousePrevious.y;
            const dl = Math.sqrt(dx * dx + dy * dy);

            texture.getFront().bind();
            myr.setAlpha(brushSpacing / brushRadius);
            
            for (let d = 0; d < dl; d += brushSpacing)
                myr.primitives.fillCircleGradient(
                    new Myr.Color(1, 0, 0, 1),
                    new Myr.Color(0, 0, 0, 0),
                    mousePrevious.x + dx * (d / dl),
                    mousePrevious.y + dy * (d / dl),
                    brushRadius
                );

            myr.setAlpha(1);
        }
    });
}