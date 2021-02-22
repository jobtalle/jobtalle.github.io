/**
 * The interface toggle
 * @param {HTMLElement} element The toggle element
 * @param {Interface} interfaceWrapper The interface to toggle
 * @constructor
 */
const InterfaceToggle = function(element, interfaceWrapper) {
    element.addEventListener("mousedown", () => {
        interfaceWrapper.toggle();
        element.classList.toggle(this.CLASS_TOGGLE);
    });
};

InterfaceToggle.prototype.CLASS_TOGGLE = "visible";