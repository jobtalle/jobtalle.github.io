const Sand = function(canvas) {
    const scale = 2;
    const speed = 3;
    const mousePrevious = new Myr.Vector(0, 0);
    const mouseCurrent = new Myr.Vector(0, 0);
    const myr = new Myr(canvas);
    const hueStep = 0.217;
    const brushRadius = 6;
    const brushSpacing = 3;
    const colors = [
        new Myr.Color(0.76, 0.34, 0.08),
        new Myr.Color(0.54, 0.23, 0.07),
        new Myr.Color(0.80, 0.69, 0.51),
        new Myr.Color(0.38, 0.25, 0.14),
        new Myr.Color(0.14, 0.10, 0.08),
        new Myr.Color(0.17, 0.22, 0.25)
    ]
    const texture = new ConvTex(
        myr,
        new myr.Shader(
            "lowp vec4 get(int dx, int dy) {" +
                "mediump vec2 location = uv + pixelSize * vec2(dx, dy);" +
                "if (location.y > 1.0)" +
                    "return vec4(1);" +
                "else if (location.y < 0.0)" +
                    "return vec4(0);" +

                "return texture(source, location);" +
            "}" +

            "void main() {" +
                "color = get(0, 0);" +

                "if (color.a == 0.0) {" +
                    "if (get(0, -1).a == 1.0)" +
                        "color = get(0, -1);" +
                    "else if (get(1, -1).a == 1.0 && get(2, 0).a == 1.0 && get(1, 0).a == 1.0 && !(get(-1, -1).a == 1.0 && get(-2, 0).a == 1.0 && get(-1, 0).a == 1.0))" +
                        "color = get(1, -1);" +
                    "else if (get(-1, -1).a == 1.0 && get(-2, 0).a == 1.0 && get(-1, 0).a == 1.0)" +
                        "color = get(-1, -1);" +
                "} else if (" +
                    "get(0, 1).a == 0.0 || (" +
                    "(get(-1, 1).a == 0.0 && get(1, 1).a == 1.0 && get(-1, 0).a == 0.0 && !(get(-2, 0).a == 1.0 && get(-3, 1).a == 1.0 && get(-2, 1).a == 1.0)) ||" +
                    "(get(1, 1).a == 0.0 && get(-1, 1).a == 1.0 && get(1, 0).a == 0.0)))" +
                    "color = vec4(0);" +
            "}",
            ["source"],
            []
        ),
        Math.ceil(myr.getWidth() / scale),
        Math.ceil(myr.getHeight() / scale));

    let colorIndex = 0;
    let brushDown = false;
    let brushColor = null;
    let hue = Math.random();

    myr.setClearColor(new Myr.Color(0.9, 0.88, 0.84));

    this.update = () => {
        for (let i = 0; i < speed; ++i)
            texture.update();

        myr.bind();
        myr.clear();

        texture.getFront().drawScaled(0, 0, scale, scale);

        myr.flush();
    };

    addMouseDown(canvas, (x, y) => {
        activate(this);

        mouseCurrent.x = x / scale;
        mouseCurrent.y = y / scale;

        brushDown = true;
        hue = (hue + hueStep) % 1;
        brushColor = colors[colorIndex];
        colorIndex = (colorIndex + 1) % colors.length;
    });

    addMouseUp(canvas, () => {
        brushDown = false;
    });

    addMouseMove(canvas, (x, y) => {
        mousePrevious.x = mouseCurrent.x;
        mousePrevious.y = mouseCurrent.y;
        mouseCurrent.x = x / scale;
        mouseCurrent.y = y / scale;

        if (brushDown && !mousePrevious.equals(mouseCurrent)) {
            const dx = mouseCurrent.x - mousePrevious.x;
            const dy = mouseCurrent.y - mousePrevious.y;
            const dl = Math.sqrt(dx * dx + dy * dy);

            texture.getFront().bind();

            for (let d = 0; d < dl; d += brushSpacing)
                myr.primitives.fillCircle(
                    brushColor,
                    mousePrevious.x + (dx / dl) * d,
                    mousePrevious.y + (dy / dl) * d,
                    brushRadius
                );
        }
    });
}