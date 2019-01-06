const Life = function(canvas) {
    const scale = 3;
    const frameDelay = 3;
    const mousePrevious = new Myr.Vector(0, 0);
    const mouseCurrent = new Myr.Vector(0, 0);
    const myr = new Myr(canvas);
    const start = new myr.Surface("posts/2019_1_3/img/life_initial.png");
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

    let initialized = false;
    let brushDown = false;
    let frame = 1;

    myr.setClearColor(new Myr.Color(0.55, 0.63, 0.74));

    const initialize = () => {
        if (!start.ready())
            return;

        texture.getFront().bind();
        start.draw(2, 2);

        initialized = true;
    };

    this.update = () => {
        if (--frame === 0) {
            texture.update();

            frame = frameDelay;
        }

        myr.bind();
        myr.clear();

        texture.getFront().drawScaled(0, 0, scale, scale);
        
        myr.flush();
    };

    addMouseDown(canvas, (x, y) => {
        activate(this);

        if (!initialized)
            initialize();

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