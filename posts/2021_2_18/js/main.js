{
    const wrapper = document.getElementById("renderer-wrapper");
    const renderer = document.getElementById("renderer");
    const symmetryWrapper = document.getElementById("symmetry-wrapper");
    let lastTime = performance.now();
    let symmetry = null;
    let lastWidth = -1;

    const create = () => {
        if (symmetry)
            symmetry.free();

        lastWidth = symmetryWrapper.clientWidth;
        symmetryWrapper.style.height = Math.round(lastWidth * .7).toString() + "px";

        symmetry = new Symmetry(renderer);

        renderer.width = wrapper.clientWidth;
        renderer.height = wrapper.clientHeight;
        symmetry.resize(renderer.width, renderer.height);

        new InterfaceToggle(
            document.getElementById("interface-toggle"),
            new Interface(
                symmetry,
                document.getElementById("interface"),
                document.getElementById("interface-rendering"),
                document.getElementById("interface-root"),
                document.getElementById("interface-planes")));
    }

    create();

    window.onresize = () => {
        if (symmetryWrapper.clientWidth !== lastWidth)
            create();
    };

    const loop = time => {
        symmetry.draw(.001 * (time - lastTime));

        lastTime = time;

        requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
}