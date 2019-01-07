const Grass = function(canvas) {
    const scale = canvas.width / 823;
    const brushRadius = 110 * scale;
    const grassThreshold = 0.45;
    const grassHeight = Math.ceil(120 * scale);
    const grassClearance = Math.ceil(5 * scale);
    const grassSpacing = Math.ceil(20 * scale);
    const grassLayers = [];
    const bladeWidth = Math.ceil(20 * scale);
    const bladeSpacing = Math.ceil(3 * scale);
    const bladeColor = new Myr.Color(0.36, 0.68, 0.33);
    const bladeBaseColor = new Myr.Color(bladeColor.r * 0.35, bladeColor.g * 0.35, bladeColor.b * 0.35);
    const dryColor = new Myr.Color(0.66, 0.56, 0.39);
    const mousePrevious = new Myr.Vector(0, 0);
    const mouseCurrent = new Myr.Vector(0, 0);
    const myr = new Myr(canvas);
    const application = new myr.Surface(myr.getWidth(), myr.getHeight());
    const background = new myr.Surface(myr.getWidth(), myr.getHeight());
    const noiseConfig = cubicNoiseConfig(Math.round(Math.random() * 2147483647), Math.ceil(80 * scale));
    const texture = new ConvTex(
        myr,
        new myr.Shader(
            "void main() {" +
                "lowp vec4 pixel = texture(source, uv);" +
                "color = clamp(vec4(" +
                    "pixel.rg + (pixel.ba - vec2(0.5)) * 0.1," +
                    "vec2(0.5) + (pixel.ba - vec2(0.5) - (pixel.rg - vec2(0.5)) * 0.07) * 0.935), 0.0, 1.0);" +
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
            "lowp vec2 uvOffset = pow(1.0 - uv.y, 2.0) * (delta - vec2(0.5));" +
            "lowp float lighting = 1.0 - uvOffset.y * 3.0;" +
            "uvOffset.y += length(uvOffset) * 5.0 * (1.0 - uv.y);" +
            "lowp vec4 sampled = texture(source, uv - uvOffset * pixelSize * 280.0);" +
            "color = vec4(sampled.rgb * lighting, sampled.a);" +
        "}",
        ["source", "displacement"],
        ["base"]
    );

    let brushDown = false;

    const sampleNoise = (x, y) => {
        return cubicNoiseSample(noiseConfig, x, y);
    };

    const GrassLayer = function(height, base) {
        const _surface = new myr.Surface(myr.getWidth(), height + grassClearance);
        const _uvy = base / myr.getHeight() + Math.random() * 0.05;
        
        const fill = () => {
            _surface.bind();
            
            for (let x = -Math.floor(Math.random() * bladeWidth); x < _surface.getWidth(); x += bladeWidth + Math.floor(Math.random() * bladeSpacing)) {
                const sample = sampleNoise(x + bladeWidth * 0.5, base);

                if (sample < grassThreshold)
                    continue;

                const h = 0.1 + sample * 0.8 + Math.random() * 0.1;
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

    background.bind();

    for (let y = 0; y < background.getHeight(); ++y) for (let x = 0; x < background.getWidth(); ++x) {
        const sample = sampleNoise(x, y);
        let wetness = Math.min(sample * (1 / (grassThreshold)), 1);

        if (wetness < 0.9) {
            if (wetness > 0.8)
                wetness -= 0.5 * (0.9 - wetness) * 10;
            else
                wetness = Math.max(0, wetness - 0.5);
        }

        const color = new Myr.Color(
            dryColor.r + wetness * (bladeBaseColor.r - dryColor.r),
            dryColor.g + wetness * (bladeBaseColor.g - dryColor.g),
            dryColor.b + wetness * (bladeBaseColor.b - dryColor.b));

        myr.primitives.drawPoint(color, x, y);
    }

    applicationShader.setSurface("source", application);

    texture.setClearColor(new Myr.Color(0.5, 0.5, 0.5, 0.5));
    texture.getFront().bind();
    texture.getFront().clear();

    for (let y = grassSpacing; y < myr.getHeight() + grassHeight; y += grassSpacing)
        grassLayers.push(new GrassLayer(grassHeight, y));

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

        background.draw(0, 0);

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
        mousePrevious.x = mouseCurrent.x;
        mousePrevious.y = mouseCurrent.y;
        mouseCurrent.x = x;
        mouseCurrent.y = y;

        if (brushDown && !mousePrevious.equals(mouseCurrent)) {
            const dx = mouseCurrent.x - mousePrevious.x;
            const dy = mouseCurrent.y - mousePrevious.y;
            const dl = Math.sqrt(dx * dx + dy * dy);
            const direction = Math.atan2(dy, dx);
            const c = 0.5 + 0.5 * Math.cos(direction);
            const s = 0.5 + 0.5 * Math.sin(direction);
            const colorInner = new Myr.Color(c, s, 0, dl / 100);
            const colorOuter = new Myr.Color(c, s, 0, 0);

            application.bind();
            application.clear();
            myr.blendDisable();
            
            myr.primitives.fillCircleGradient(
                colorInner,
                colorOuter,
                mouseCurrent.x,
                mouseCurrent.y,
                brushRadius
            );

            myr.setAlpha(1);
            myr.blendEnable();

            brushed = true;
        }
    });
}