/**
 * A plane interface
 * @param {Symmetry} symmetry The symmetry object
 * @param {Plane} plane The plane to edit
 * @param {Function} removeMe A function that removes this interface from the GUI
 * @param {Function} moveUp Move the interface up
 * @param {Function} moveDown Move the interface down
 * @returns {HTMLElement} The interface
 * @constructor
 */
const InterfacePlane = function(symmetry, plane, removeMe, moveUp, moveDown) {
    return this.createCategory(
        this.TITLE,
        this.createElement(symmetry, plane, removeMe, moveUp, moveDown),
        true);
};

InterfacePlane.prototype = Object.create(InterfaceElement.prototype);
InterfacePlane.prototype.TITLE = "Symmetry plane";
InterfacePlane.prototype.COORDINATE_RANGE = new Range(-2, 2);
InterfacePlane.prototype.ROTATION_RANGE_X = new Range(0, Math.PI * 2);
InterfacePlane.prototype.ROTATION_RANGE_Y = new Range(0, Math.PI * 2);

/**
 * Create the element
 * @param {Symmetry} symmetry The symmetry object
 * @param {Plane} plane The plane to edit
 * @param {Function} removeMe A function that removes this interface from the GUI
 * @param {Function} moveUp Move the interface up
 * @param {Function} moveDown Move the interface down
 * @returns {HTMLElement} The HTML element
 */
InterfacePlane.prototype.createElement = function(symmetry, plane, removeMe, moveUp, moveDown) {
    const element = document.createElement("div");
    const buttonUp = document.createElement("button");
    const buttonDown = document.createElement("button");
    const buttonDelete = document.createElement("button");

    element.style.backgroundColor = "hsla(" + (360 * Math.random()) + ",40%,40%,40%)";

    buttonUp.appendChild(document.createTextNode("▲"));
    buttonDown.appendChild(document.createTextNode("▼"));
    buttonDelete.appendChild(document.createTextNode("Delete"));

    buttonUp.onclick = () => {
        const index = symmetry.planes.indexOf(plane);

        if (index > 0) {
            symmetry.planes.splice(index - 1, 0, ...symmetry.planes.splice(index, 1));
            symmetry.updatePlanes();

            moveUp();
        }
    };

    buttonDown.onclick = () => {
        const index = symmetry.planes.indexOf(plane);

        if (index < symmetry.planes.length - 1) {
            symmetry.planes.splice(index + 1, 0, ...symmetry.planes.splice(index, 1));
            symmetry.updatePlanes();

            moveDown();
        }
    };

    buttonDelete.onclick = () => {
        symmetry.planes.splice(symmetry.planes.indexOf(plane), 1);
        symmetry.updatePlanes();

        removeMe();
    };

    element.appendChild(this.createSlider(
        "Anchor x: ",
        this.COORDINATE_RANGE,
        plane.anchor.x,
        .01,
        value => {
            plane.anchor.x = value;

            symmetry.updatePlanes();
        }
    ));

    element.appendChild(this.createSlider(
        "Anchor y: ",
        this.COORDINATE_RANGE,
        plane.anchor.y,
        .01,
        value => {
            plane.anchor.y = value;

            symmetry.updatePlanes();
        }
    ));

    element.appendChild(this.createSlider(
        "Anchor z: ",
        this.COORDINATE_RANGE,
        plane.anchor.z,
        .01,
        value => {
            plane.anchor.z = value;

            symmetry.updatePlanes();
        }
    ));

    element.appendChild(this.createSlider(
        "Rotation X: ",
        this.ROTATION_RANGE_X,
        plane.rotationX,
        .01,
        value => {
            plane.rotationX = value;

            symmetry.updatePlanes();
        }
    ));

    element.appendChild(this.createSlider(
        "Rotation Y: ",
        this.ROTATION_RANGE_Y,
        plane.rotationY,
        .01,
        value => {
            plane.rotationY = value;

            symmetry.updatePlanes();
        }
    ));

    element.appendChild(buttonUp);
    element.appendChild(buttonDown);
    element.appendChild(buttonDelete);

    return element;
};