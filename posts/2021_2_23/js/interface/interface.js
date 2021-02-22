/**
 * The interface
 * @param {Symmetry} symmetry The symmetry object
 * @param {HTMLElement} interfaceWrapper The element containing all interface elements
 * @param {HTMLElement} rendering The element containing the rendering interface
 * @param {HTMLElement} root The element containing the root model interface
 * @param {HTMLElement} planes The element containing the symmetry plane interfaces
 * @constructor
 */
const Interface = function(
    symmetry,
    interfaceWrapper,
    rendering,
    root,
    planes) {
    this.interfaceWrapper = interfaceWrapper;

    while (rendering.firstChild)
        rendering.removeChild(rendering.firstChild);

    while (root.firstChild)
        root.removeChild(root.firstChild);

    while (planes.firstChild)
        planes.removeChild(planes.firstChild);

    rendering.appendChild(new InterfaceRendering(symmetry.geometry));
    root.appendChild(new InterfaceRoot(symmetry.geometry));
    planes.appendChild(new InterfacePlanes(symmetry));
};

Interface.prototype.CLASS_TOGGLE = "visible";

/**
 * Toggle visibility
 */
Interface.prototype.toggle = function() {
    this.interfaceWrapper.classList.toggle(this.CLASS_TOGGLE);
};