function addMouseDown(target, f) {
    target.addEventListener("mousedown", event =>
        f(event.clientX - target.getBoundingClientRect().left, event.clientY - target.getBoundingClientRect().top));
    
    target.addEventListener("touchstart", event =>
        f(event.touches[0].clientX - target.getBoundingClientRect().left, event.touches[0].clientY - target.getBoundingClientRect().top));
}

function addMouseMove(target, f) {
    target.addEventListener("mousemove", event =>
        f(event.clientX - target.getBoundingClientRect().left, event.clientY - target.getBoundingClientRect().top));
    
    target.addEventListener("touchmove", event => {
        if (event.cancelable)
            event.preventDefault();

        f(event.touches[0].clientX - target.getBoundingClientRect().left, event.touches[0].clientY - target.getBoundingClientRect().top)
    });
};

function addMouseUp(target, f) {
    target.addEventListener("mouseup", event =>
        f(event.clientX - target.getBoundingClientRect().left, event.clientY - target.getBoundingClientRect().top));
    
    target.addEventListener("touchend", event =>
        f(0, 0));
}