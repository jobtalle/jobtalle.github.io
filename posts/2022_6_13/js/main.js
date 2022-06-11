import {gl} from "./gl.js";
import {ShaderSpots} from "./shaderSpots.js";
import {Color} from "./color.js";
import {ShaderBlit} from "./shaderBlit.js";
import {ShaderShape} from "./shaderShape.js";
import {ShaderMesh} from "./shaderMesh.js";
import {Mesh} from "./mesh.js";

{
    const colorA = Color.fromHex(getComputedStyle(document.body).getPropertyValue("--color-a").trim());
    const colorB = Color.fromHex(getComputedStyle(document.body).getPropertyValue("--color-b").trim());
    const colorShade = Color.fromHex(getComputedStyle(document.body).getPropertyValue("--color-shade").trim());
    const colorEye = Color.fromHex(getComputedStyle(document.body).getPropertyValue("--color-eye").trim());
    const renderer = document.getElementById("renderer");
    const width = renderer.clientWidth;
    const height = renderer.clientHeight;
    const shaderSpots = new ShaderSpots();
    const shaderShape = new ShaderShape();
    const shaderBlit = new ShaderBlit();
    const shaderMesh = new ShaderMesh();
    const texturePattern = gl.createTexture();
    const textureShape = gl.createTexture();
    const framebufferPattern = gl.createFramebuffer();
    const framebufferShape = gl.createFramebuffer();
    const controls = document.getElementById("controls");
    const controlsTexture = document.getElementById("controls-texture");
    const controlsShape = document.getElementById("controls-shape");
    const controlsAnimation = document.getElementById("controls-animation");
    const sliderX = document.getElementById("var-x");
    const sliderY = document.getElementById("var-y");
    const sliderZ = document.getElementById("var-z");
    const sliderXRotation = document.getElementById("var-x-rotation");
    const sliderYRotation = document.getElementById("var-y-rotation");
    const sliderThreshold = document.getElementById("var-threshold");
    const sliderScale = document.getElementById("var-scale");
    const sliderRadius = document.getElementById("var-radius");
    const sliderCenter = document.getElementById("var-center");
    const sliderThickness = document.getElementById("var-thickness");
    const sliderEyePosition = document.getElementById("var-eye-position");
    const fieldX = document.getElementById("field-x");
    const fieldY = document.getElementById("field-y");
    const fieldZ = document.getElementById("field-z");
    const fieldXRotation = document.getElementById("field-x-rotation");
    const fieldYRotation = document.getElementById("field-y-rotation");
    const fieldThreshold = document.getElementById("field-threshold");
    const fieldScale = document.getElementById("field-scale");
    const fieldRadius = document.getElementById("field-radius");
    const fieldCenter = document.getElementById("field-center");
    const fieldThickness = document.getElementById("field-thickness");
    const fieldEyePosition = document.getElementById("field-eye-position");
    const buttonRandomize = document.getElementById("button-randomize");
    const buttonMutate = document.getElementById("button-mutate");
    const modeTexture = document.getElementById("mode-texture");
    const modeShape = document.getElementById("mode-shape");
    const modeAnimated = document.getElementById("mode-animated");
    const mesh = new Mesh(width, height);
    let mode = 0;
    let varX = Number.parseFloat(fieldX.value);
    let varY = Number.parseFloat(fieldY.value);
    let varZ = Number.parseFloat(fieldZ.value);
    let varXRotation = Number.parseFloat(fieldXRotation.value);
    let varYRotation = Number.parseFloat(fieldYRotation.value);
    let varThreshold = Number.parseFloat(fieldThreshold.value);
    let varScale = Number.parseFloat(fieldScale.value);
    let varRadius = Number.parseFloat(fieldRadius.value);
    let varCenter = Number.parseFloat(fieldCenter.value);
    let varThickness = Number.parseFloat(fieldThickness.value);
    let varEyePosition = Number.parseFloat(fieldEyePosition.value);

    gl.bindTexture(gl.TEXTURE_2D, texturePattern);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width << 1, height << 1, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferPattern);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texturePattern, 0);

    gl.bindTexture(gl.TEXTURE_2D, textureShape);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width << 1, height << 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferShape);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureShape, 0);

    shaderMesh.use();
    shaderMesh.setSize(width, height);

    const renderTextures = () => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferPattern);

        shaderSpots.use();
        shaderSpots.setColors(colorA, colorB);
        shaderSpots.setScale(varScale * .004);
        shaderSpots.setSize(width, height);
        shaderSpots.setThreshold(varThreshold);
        shaderSpots.setPosition(varX, varY, varZ);
        shaderSpots.setRotation(Math.PI * varXRotation / 180, Math.PI * varYRotation / 180);

        gl.viewport(0, 0, width << 1, height << 1);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        switch (mode) {
            case 0:
                shaderBlit.use();

                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.viewport(0, 0, width, height);
                gl.bindTexture(gl.TEXTURE_2D, texturePattern);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

                break;
            case 1:
            case 2:
                shaderShape.use();
                shaderShape.setRadius(varRadius);
                shaderShape.setCenter(varCenter);
                shaderShape.setThickness(varThickness);
                shaderShape.setShade(colorShade);
                shaderShape.setSize(width, height);
                shaderShape.setEye(colorEye);
                shaderShape.setEyePosition(varEyePosition);

                gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferShape);
                gl.viewport(0, 0, width << 1, height << 1);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.bindTexture(gl.TEXTURE_2D, texturePattern);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

                shaderBlit.use();

                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.viewport(0, 0, width, height);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.bindTexture(gl.TEXTURE_2D, textureShape);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

                break;
        }
    };

    const formatFieldNumber = number => {
        return Number.parseFloat(number.toFixed(4));
    };

    const randomizeSlider = slider => {
        const low = Number.parseFloat(slider.min);
        const high = Number.parseFloat(slider.max);
        const step = Number.parseFloat(slider.step);
        const value = low + step * Math.round(Math.random() * (high - low) / step);

        slider.value = value;

        return value;
    };

    const mutateSlider = (slider, radius = 6) => {
        const low = Number.parseFloat(slider.min);
        const high = Number.parseFloat(slider.max);
        const step = Number.parseFloat(slider.step);
        const current = Number.parseFloat(slider.value);
        const value = Math.max(low, Math.min(high, current + Math.round((Math.random() * 2 - 1) * radius) * step));

        slider.value = value;

        return value;
    };

    modeTexture.addEventListener("click", () => {
        mode = 0;

        controlsTexture.classList.remove("hidden");
        controlsShape.classList.add("hidden");
        controlsAnimation.classList.add("hidden");

        renderTextures();
    });

    modeShape.addEventListener("click", () => {
        mode = 1;

        controlsTexture.classList.add("hidden");
        controlsShape.classList.remove("hidden");
        controlsAnimation.classList.add("hidden");

        renderTextures();
    });

    modeAnimated.addEventListener("click", () => {
        mode = 2;

        controlsTexture.classList.add("hidden");
        controlsShape.classList.add("hidden");
        controlsAnimation.classList.remove("hidden");

        renderTextures();

        mesh.initialize();
    });

    buttonRandomize.addEventListener("click", () => {
        fieldX.value = formatFieldNumber(varX = randomizeSlider(sliderX));
        fieldY.value = formatFieldNumber(varY = randomizeSlider(sliderY));
        fieldZ.value = formatFieldNumber(varZ = randomizeSlider(sliderZ));
        fieldXRotation.value = formatFieldNumber(varXRotation = randomizeSlider(sliderXRotation));
        fieldYRotation.value = formatFieldNumber(varYRotation = randomizeSlider(sliderYRotation));
        fieldThreshold.value = formatFieldNumber(varThreshold = randomizeSlider(sliderThreshold));
        fieldScale.value = formatFieldNumber(varScale = randomizeSlider(sliderScale));

        if (mode >= 1) {
            fieldRadius.value = formatFieldNumber(varRadius = randomizeSlider(sliderRadius));
            fieldCenter.value = formatFieldNumber(varCenter = randomizeSlider(sliderCenter));
            fieldThickness.value = formatFieldNumber(varThickness = randomizeSlider(sliderThickness));
            fieldEyePosition.value = formatFieldNumber(varEyePosition = randomizeSlider(sliderEyePosition));
        }

        renderTextures();
    });

    buttonMutate.addEventListener("click", () => {
        fieldX.value = formatFieldNumber(varX = mutateSlider(sliderX));
        fieldY.value = formatFieldNumber(varY = mutateSlider(sliderY));
        fieldZ.value = formatFieldNumber(varZ = mutateSlider(sliderZ));
        fieldXRotation.value = formatFieldNumber(varXRotation = mutateSlider(sliderXRotation));
        fieldYRotation.value = formatFieldNumber(varYRotation = mutateSlider(sliderYRotation));
        fieldThreshold.value = formatFieldNumber(varThreshold = mutateSlider(sliderThreshold));
        fieldScale.value = formatFieldNumber(varScale = mutateSlider(sliderScale));

        if (mode >= 1) {
            fieldRadius.value = formatFieldNumber(varRadius = mutateSlider(sliderRadius));
            fieldCenter.value = formatFieldNumber(varCenter = mutateSlider(sliderCenter));
            fieldThickness.value = formatFieldNumber(varThickness = mutateSlider(sliderThickness));
            fieldEyePosition.value = formatFieldNumber(varEyePosition = mutateSlider(sliderEyePosition));
        }

        renderTextures();
    });

    sliderX.addEventListener("input", () => {
        varX = Number.parseFloat(sliderX.value);
        fieldX.value = varX.toString();

        renderTextures();
    });

    sliderY.addEventListener("input", () => {
        varY = Number.parseFloat(sliderY.value);
        fieldY.value = varY.toString();

        renderTextures();
    });

    sliderZ.addEventListener("input", () => {
        varZ = Number.parseFloat(sliderZ.value);
        fieldZ.value = varZ.toString();

        renderTextures();
    });

    sliderXRotation.addEventListener("input", () => {
        varXRotation = Number.parseFloat(sliderXRotation.value);
        fieldXRotation.value = varXRotation.toString();

        renderTextures();
    });

    sliderYRotation.addEventListener("input", () => {
        varYRotation = Number.parseFloat(sliderYRotation.value);
        fieldYRotation.value = varYRotation.toString();

        renderTextures();
    });

    sliderThreshold.addEventListener("input", () => {
        varThreshold = Number.parseFloat(sliderThreshold.value);
        fieldThreshold.value = varThreshold.toString();

        renderTextures();
    });

    sliderScale.addEventListener("input", () => {
        varScale = Number.parseFloat(sliderScale.value);
        fieldScale.value = varScale.toString();

        renderTextures();
    });

    sliderRadius.addEventListener("input", () => {
        varRadius = Number.parseFloat(sliderRadius.value);
        fieldRadius.value = varRadius.toString();

        renderTextures();
    });

    sliderCenter.addEventListener("input", () => {
        varCenter = Number.parseFloat(sliderCenter.value);
        fieldCenter.value = varCenter.toString();

        renderTextures();
    });

    sliderThickness.addEventListener("input", () => {
        varThickness = Number.parseFloat(sliderThickness.value);
        fieldThickness.value = varThickness.toString();

        renderTextures();
    });

    sliderEyePosition.addEventListener("input", () => {
        varEyePosition = Number.parseFloat(sliderEyePosition.value);
        fieldEyePosition.value = varEyePosition.toString();

        renderTextures();
    });

    renderTextures();

    controls.style.height = controls.clientHeight + "px";

    const updateRate = 1 / 20;
    let lastTime = performance.now();
    let updateTime = 0;

    const loop = time => {
        if (mode === 2) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, width, height);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.bindTexture(gl.TEXTURE_2D, textureShape);

            shaderMesh.use();

            mesh.draw(updateTime / updateRate);
        }

        updateTime += Math.min(.1, .001 * Math.max(0, time - lastTime));

        while (updateTime > updateRate) {
            if (mode === 2)
                mesh.update();

            updateTime -= updateRate;
        }

        lastTime = time;

        requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
}