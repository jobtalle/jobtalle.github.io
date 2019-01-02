const Life = function(canvas) {
    const scale = 3;
    const mousePrevious = new Myr.Vector(0, 0);
    const mouseCurrent = new Myr.Vector(0, 0);
    const myr = new Myr(canvas);
    const texture = new ConvTex(
        myr,
        new myr.Shader(
            "int get(int dx, int dy) {" +
                "return int(texture(source, uv + pixelSize * vec2(dx, dy)).r);" +
            "}" +

            "void main() {" +
                "int live = get(0, 0);" +
                "int neighbors =" +
                    "get(-1, -1) +" +
                    "get(0, -1) +" +
                    "get(1, -1) +" +
                    "get(-1, 0) +" +
                    "get(1, 0) +" +
                    "get(-1, 1) +" +
                    "get(0, 1) +" +
                    "get(1, 1);" +
                "if (live == 1 && neighbors < 2)" +
                    "color = vec4(0);" +
                "else if (live == 1 && (neighbors == 2 || neighbors == 3))" +
                    "color = vec4(1);" +
                "else if (live == 1 && neighbors == 3)" +
                    "color = vec4(0);" +
                "else if (live == 0 && neighbors == 3)" +
                    "color = vec4(1);" +
                "else color = vec4(0);" +
            "}",
            ["source"],
            []
        ),
        Math.ceil(myr.getWidth() / scale),
        Math.ceil(myr.getHeight() / scale));

    let brushDown = false;
    let skip = false;

    myr.setClearColor(new Myr.Color(0.6, 0.6, 0.6));

    this.update = () => {
        if (!skip)
            texture.update();

        skip = !skip;

        myr.bind();
        myr.clear();

        texture.getFront().drawScaled(0, 0, scale, scale);

        myr.flush();
    };

    this.reset = () => {
        texture.getFront().bind();
        texture.getFront().clear();
        
        this.update();
    };

    addMouseDown(canvas, (x, y) => {
        activate(this);

        mouseCurrent.x = x / scale;
        mouseCurrent.y = y / scale;

        brushDown = true;
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
            texture.getFront().bind();
            
            myr.primitives.drawLine(
                Myr.Color.WHITE,
                mousePrevious.x,
                mousePrevious.y,
                mouseCurrent.x,
                mouseCurrent.y
            );
        }
    });
};