const Water = function(canvas) {
    const brushRadius = 16;
    const brushSpacing = brushRadius * 0.25;
    const mousePrevious = new Myr.Vector(0, 0);
    const mouseCurrent = new Myr.Vector(0, 0);
    const myr = new Myr(canvas);
    const image = new myr.Surface(myr.getWidth(), myr.getHeight());
    const sand = new myr.Surface("posts/2019_1_7/img/default_water.jpg");
    const texture = new ConvTex(
        myr,
        new myr.Shader(
            "void main() {" +
                "lowp float damping = 0.998;" +
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
    let initialized = false;

    displacementShader.setSurface("source", image);
    texture.setClearColor(new Myr.Color(0, 0, 0, 1));
    texture.getFront().bind();
    texture.getFront().clear();

    myr.setClearColor(Myr.Color.WHITE);

    this.update = () => {
        brushed = false;
        
        if (!initialized && sand.ready()) {
            image.bind();
            sand.draw(0, 0);

            initialized = true;
        }

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