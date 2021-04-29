const SliderClassName = 'slider';
const SliderContainerLineClassName = 'slider-container-line';
const SliderLineClassName = 'slider-line';
const SliderImgClassName = 'slider-img';
const SliderNavClassName = 'slider-nav';
const SliderNavLeftClassName = 'slider-nav-left';
const SliderNavRightClassName = 'slider-nav-right';
const SliderNavDisabledClassName = 'slider-nav-disabled';
const SliderDragClassName = 'slider-drag';
class Slider {
  constructor(element) {
    this.containerNode = element;
    this.size = element.childElementCount;
    this.currentImg = 0;
    this.currentImgChanged = false;

    this.setHTML = this.setHTML.bind(this);
    this.setParameters = this.setParameters.bind(this);
    this.setEvents = this.setEvents.bind(this);
    this.resizeSlider = this.resizeSlider.bind(this);
    this.startDrag = this.startDrag.bind(this);
    this.drag = this.drag.bind(this);
    this.stopDrag = this.stopDrag.bind(this);
    this.setPosition = this.setPosition.bind(this);
    this.shiftLeft = this.shiftLeft.bind(this);
    this.shiftRight = this.shiftRight.bind(this);
    this.changeCurrentImg = this.changeCurrentImg.bind(this);
    this.changeDisabledNav = this.changeDisabledNav.bind(this);

    this.setHTML();
    this.setParameters();
    this.setEvents();
  }

  setHTML() {
    this.containerNode.classList.add(SliderClassName);
    this.containerNode.innerHTML = `
            <div class="${SliderContainerLineClassName}">
                <div class="${SliderLineClassName}">
                    ${this.containerNode.innerHTML}
                </div>
            </div>
             <div class="${SliderNavClassName}">
                <button class="${SliderNavLeftClassName}"></button>
                 <button class="${SliderNavRightClassName}"></button>
             </div>
          `;

    this.lineContainerNode = this.containerNode.querySelector(
      `.${SliderContainerLineClassName}`
    );
    this.lineNode = this.containerNode.querySelector(`.${SliderLineClassName}`);

    //create array of divs with className that wrap images
    this.slideNodes = Array.from(this.lineNode.children).map((childNode) =>
      wrapElement({
        element: childNode,
        className: SliderImgClassName,
      })
    );

    this.navLeft = this.containerNode.querySelector(
      `.${SliderNavLeftClassName}`
    );
    this.navRight = this.containerNode.querySelector(
      `.${SliderNavRightClassName}`
    );
  }
  //set parameters for slider container and images to manipulate their width
  setParameters() {
    const containerLinePosition = this.lineContainerNode.getBoundingClientRect();
    this.width = containerLinePosition.width;
    this.x = -this.currentImg * this.width;
    this.resetTransition();
    this.lineNode.style.width = `${this.size * this.width}px`;
    this.setPosition();
    this.changeDisabledNav();

    //set width for each image
    Array.from(this.slideNodes).forEach((slideNode) => {
      slideNode.style.width = `${this.width}px`;
    });
  }

  //add event listeners
  setEvents() {
    window.addEventListener('resize', this.resizeSlider);
    this.lineNode.addEventListener('pointerdown', this.startDrag);
    window.addEventListener('pointerup', this.stopDrag);
    window.addEventListener('pointercancel', this.stopDrag);
    this.navLeft.addEventListener('click', this.shiftLeft);
    this.navRight.addEventListener('click', this.shiftRight);
  }
  //clean up event listeners to avoid memory leaks
  removeEvents() {
    window.removeEventListener('resize', this.resizeSlider);
    this.lineNode.removeEventListener('pointerdown', this.startDrag);
    window.removeEventListener('pointerup', this.stopDrag);
    window.removeEventListener('pointercancel', this.stopDrag);
    this.navLeft.removeEventListener('click', this.shiftLeft);
    this.navRight.removeEventListener('click', this.shiftRight);
  }
  //recalculate the width of the slider on screen resizing
  resizeSlider() {
    this.setParameters();
  }

  startDrag(e) {
    this.currentImgChanged = false; //condition for an image shift
    this.clickX = e.pageX;
    this.startX = this.x;
    this.resetTransition();
    this.containerNode.classList.add(SliderDragClassName);
    window.addEventListener('pointermove', this.drag);
  }

  drag(e) {
    this.dragX = e.pageX;
    const shift = this.dragX - this.clickX;
    this.x = this.startX + shift;
    this.setPosition();

    // Change current image
    if (
      shift > 20 && //if shift less than 20px, ignore it
      shift > 0 &&
      !this.currentImgChanged &&
      this.currentImg > 0
    ) {
      this.currentImgChanged = true;
      this.currentImg = this.currentImg - 1;
    }
    if (
      shift < -20 &&
      shift < 0 &&
      !this.currentImgChanged &&
      this.currentImg < this.size - 1
    ) {
      this.currentImgChanged = true;
      this.currentImg = this.currentImg + 1;
    }
  }

  stopDrag() {
    window.removeEventListener('pointermove', this.drag);
    this.containerNode.classList.remove(SliderDragClassName);
    this.changeCurrentImg();
  }

  shiftLeft() {
    if (this.currentImg <= 0) {
      return;
    }
    this.currentImg = this.currentImg - 1;
    this.changeCurrentImg();
  }

  shiftRight() {
    if (this.currentImg >= this.size - 1) {
      return;
    }
    this.currentImg = this.currentImg + 1;
    this.changeCurrentImg();
  }

  changeCurrentImg() {
    this.x = -this.currentImg * this.width;
    this.setTransition();
    this.setPosition();
    this.changeDisabledNav();
  }

  //change position on drag
  setPosition() {
    this.lineNode.style.transform = `translate3d(${this.x}px, 0, 0)`;
  }

  setTransition() {
    this.lineNode.style.transition = `all 0.25s ease 0s`;
  }

  resetTransition() {
    this.lineNode.style.transition = `all 0s ease 0s`;
  }

  changeDisabledNav() {
    if (this.currentImg <= 0) {
      this.navLeft.classList.add(SliderNavDisabledClassName);
    } else {
      this.navLeft.classList.remove(SliderNavDisabledClassName);
    }
    if (this.currentImg >= this.size - 1) {
      this.navRight.classList.add(SliderNavDisabledClassName);
    } else {
      this.navRight.classList.remove(SliderNavDisabledClassName);
    }
  }
}
//Helper function to wrap each image element in div
function wrapElement({ element, className }) {
  const wrapperNode = document.createElement('div');
  wrapperNode.classList.add(className);
  element.parentNode.insertBefore(wrapperNode, element);
  wrapperNode.appendChild(element);

  return wrapperNode;
}
