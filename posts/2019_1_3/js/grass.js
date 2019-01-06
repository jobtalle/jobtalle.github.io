const Grass = function(canvas) {
    const scale = canvas.width / 823;
    const brushRadius = 150 * scale;
    const grassHeight = Math.ceil(100 * scale);
    const grassClearance = Math.ceil(5 * scale);
    const grassSpacing = Math.ceil(20 * scale);
    const grassLayers = [];
    const bladeWidth = Math.ceil(20 * scale);
    const bladeSpacing = Math.ceil(4 * scale);
    const bladeColor = new Myr.Color(0.36, 0.68, 0.33);
    const bladeBaseColor = new Myr.Color(0.36 * 0.4, 0.68 * 0.4, 0.33 * 0.4);
    const mousePrevious = new Myr.Vector(0, 0);
    const mouseCurrent = new Myr.Vector(0, 0);
    const myr = new Myr(canvas);
    const application = new myr.Surface(myr.getWidth(), myr.getHeight());
    const applyPush = new myr.Surface(brushRadius * 2, brushRadius * 2);
    const noiseConfig = cubicNoiseConfig(Math.round(Math.random() * (1 << 32)), Math.ceil(64 * scale));
    const texture = new ConvTex(
        myr,
        new myr.Shader(
            "void main() {" +
                "lowp vec4 pixel = texture(source, uv);" +
                "color = clamp(vec4(" +
                    "pixel.rg + (pixel.ba - vec2(0.5)) * 0.1," +
                    "vec2(0.5) + (pixel.ba - vec2(0.5) - (pixel.rg - vec2(0.5)) * 0.1) * 0.95), 0.0, 1.0);" +
            "}",
            ["source"],
            []
        ),
        myr.getWidth(),
        myr.getHeight(),
        1);

    const applicationShader = new myr.Shader(
        "void main() {" +
            "lowp vec4 sourcePixel = texture(source, uv) * colorFilter;" +
            "lowp vec4 targetPixel = texture(target, uv);" +
            "color = vec4(targetPixel.rg, targetPixel.ba + (sourcePixel.rg - vec2(0.5)) * sourcePixel.a);" +
        "}",
        ["target", "source"],
        []
    );

    const grassShader = new myr.Shader(
        "void main() {" +
            "lowp vec2 delta = texture(displacement, vec2(uv.x, base)).xy;" +
            "lowp vec2 uvOffset = (1.0 - uv.y) * (delta - vec2(0.5));" +
            "lowp float lighting = 1.0 - uvOffset.y * 2.0;" +
            "uvOffset.y += length(uvOffset) * 3.0 * (1.0 - uv.y);" +
            "color = texture(source, uv - uvOffset * pixelSize * 180.0) * lighting;" +
        "}",
        ["source", "displacement"],
        ["base"]
    );

    let brushDown = false;

    const GrassLayer = function(height, base) {
        const _surface = new myr.Surface(myr.getWidth(), height + grassClearance);
        const _uvy = base / myr.getHeight() + Math.random() * 0.05;
        
        const fill = () => {
            _surface.bind();
            
            for (let x = -Math.floor(Math.random() * bladeWidth); x < _surface.getWidth(); x += bladeWidth + Math.floor(Math.random() * bladeSpacing)) {
                const sample = cubicNoiseSample(noiseConfig, x, base);
                const h = 0.4 + sample * 0.6;
                const color = bladeColor.copy();
                const lighting = 0.65 + 0.35 * sample;
                
                color.multiply(new Myr.Color(lighting, lighting, lighting));

                myr.primitives.drawTriangleGradient(
                    bladeBaseColor,
                    x, height + grassClearance,
                    bladeBaseColor,
                    x + bladeWidth, height + grassClearance,
                    color,
                    x + bladeWidth * 0.5, grassClearance + height * (1 - h)
                );
            }
        };
        
        this.draw = () => {
            grassShader.setVariable("base", _uvy);
            grassShader.setSurface("source", _surface);
            grassShader.draw(0, base - height - grassClearance);
        };

        this.getBase = () => base;

        fill();
    };

    let brushed = false;

    applicationShader.setSurface("source", application);

    // Initialize convtex
    texture.setClearColor(new Myr.Color(0.5, 0.5, 0.5, 0.5));
    texture.getFront().bind();
    texture.getFront().clear();

    // Initialize push shape
    applyPush.bind();

    for (let y = 0; y < applyPush.getHeight(); ++y) for (let x = 0; x < applyPush.getWidth(); ++x) {
        const delta = new Myr.Vector(x - brushRadius, y - brushRadius);
        const length = delta.length();
        const direction = delta.angle();

        if (length > brushRadius)
            continue;
        
        myr.blendDisable();
        myr.primitives.drawPoint(new Myr.Color(
            0.5 + 0.5 * Math.cos(direction),
            0.5 + 0.5 * Math.sin(direction),
            0,
            Math.min(1 - length / brushRadius, length / brushRadius)
        ), x, y);
        myr.blendEnable();
    }

    // Initialize grass
    for (let y = grassSpacing; y < myr.getHeight() + grassHeight; y += grassSpacing) {
        const layer = new GrassLayer(grassHeight, y);

        grassLayers.push(layer);
    }

    myr.setClearColor(bladeBaseColor);

    this.update = () => {
        if (brushed) {
            texture.apply(applicationShader);

            application.bind();
            application.clear();
        }

        brushed = false;
        
        texture.update();

        myr.bind();
        myr.clear();

        grassShader.setSurface("displacement", texture.getFront());

        for (const layer of grassLayers)
            layer.draw();

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
        activate(this);

        mousePrevious.x = mouseCurrent.x;
        mousePrevious.y = mouseCurrent.y;
        mouseCurrent.x = x;
        mouseCurrent.y = y;

        if (brushDown && !mousePrevious.equals(mouseCurrent)) {
            const dx = mouseCurrent.x - mousePrevious.x;
            const dy = mouseCurrent.y - mousePrevious.y;
            const dl = Math.sqrt(dx * dx + dy * dy);

            application.bind();
            application.clear();
            myr.blendDisable();
            myr.setAlpha(Math.min(1, dl / 80));
            
            applyPush.draw(
                mousePrevious.x - brushRadius,
                mousePrevious.y - brushRadius,
            );

            myr.setAlpha(1);
            myr.blendEnable();

            brushed = true;
        }
    });
}