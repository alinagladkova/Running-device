"use strict";

function createElement(html) {
  const root = document.createElement("div");
  root.insertAdjacentHTML("beforeend", html);
  return root.firstElementChild;
}

class BasicComponent {
  _element = null;
  _subElements = {};

  constructor() {}

  _init() {
    this._element = createElement(this._getTemplate());
    this._subElements = this._getSubElements();
  }

  _getSubElements() {
    return Array.from(this._element.querySelectorAll("[data-element]")).reduce((acc, el) => {
      return {
        ...acc,
        [el.getAttribute("data-element")]: el,
      };
    }, {});
  }

  get element() {
    return this._element;
  }
}

class Wrapper extends BasicComponent {
  _state = {
    goal: 0,
  };

  constructor({ type, volume, goal }, Counter, Level, Control) {
    super();
    this._type = type;
    this._volume = volume;
    this._setStateGoal(goal);
    this._Counter = Counter;
    this._Level = Level;
    this._Control = Control;
    this._init();
  }

  _init() {
    super._init();
    this._render();
  }

  _setStateGoal(value) {
    this._state.goal = value;
  }

  _controlMoreHandler() {
    if (this._state.goal + 5 > 100) {
      return;
    }
    this._setStateGoal(this._state.goal + 5);
    this._render();
  }

  _controlLessHandler() {
    if (this._state.goal - 5 < 0) {
      return;
    }
    this._setStateGoal(this._state.goal - 5);
    this._render();
  }

  _render() {
    this._element.innerHTML = "";
    this._element.insertAdjacentElement("beforeend", new this._Counter({ volume: this._volume, goal: this._state.goal }).element);
    this._element.insertAdjacentElement("beforeend", new this._Level({ goal: this._state.goal }).element);
    this._element.insertAdjacentElement("beforeend", new this._Control(this._controlMoreHandler.bind(this), this._controlLessHandler.bind(this)).element);
  }

  _getTemplate() {
    return `<div class="running-wrapper"></div>`;
  }
}

class Counter extends BasicComponent {
  constructor({ volume, goal }) {
    super();
    this._volume = volume;
    this._goal = goal;
    this._init();
  }

  _init() {
    super._init();
  }

  _getCalculateGoal() {
    return (this._volume * this._goal) / 100;
  }

  _getTemplate() {
    return `
			<div class="running-details">
        <h3 class="running-details__title">Running <i class="fa-solid fa-person-running"></i></h3>
        <div class="running-details__distance">${this._volume} m / ${this._getCalculateGoal()} m</div>
      </div>`;
  }
}

class Level extends BasicComponent {
  constructor({ goal }) {
    super();
    this._goal = goal;
    this._init();
  }

  _init() {
    super._init();
  }

  _getDifficultyLevel() {
    if (this._goal > 0 && this._goal < 30) {
      return `легко`;
    }
    if (this._goal > 30 && this._goal < 70) {
      return `средне`;
    }
    return "сложно";
  }

  _colorizeDifficultyLevel() {
    if (this._goal > 0 && this._goal < 30) {
      return `running-level__title--easy`;
    }
    if (this._goal > 30 && this._goal < 70) {
      return `running-level__title--average`;
    }
    return "running-level__title--hard";
  }

  _getTemplate() {
    return `
			<div class="running-level">
        <h3 class="running-level__title ${this._colorizeDifficultyLevel()}">сложность: ${this._getDifficultyLevel()}</h3>
        <div class="running-level__level-area">
          <div class="running-level__level-percentage" data-element="percentage">${this._goal}%</div>
          <div class="running-level__level-bar">
            <div class="running-level__level-actual" data-element="actual" style="width:${this._goal}%;"></div>
          </div>
        </div>
      </div>`;
  }

  // style={{width:`${this._goal}%`}}
}

class Control extends BasicComponent {
  constructor(controlMoreHandler, controlLessHandler) {
    super();
    this._controlMoreHandler = controlMoreHandler;
    this._controlLessHandler = controlLessHandler;
    this._init();
  }

  _init() {
    super._init();
    this._addListeners();
  }

  _addListeners() {
    this._subElements.less.addEventListener("click", () => this._controlLessHandler());

    this._subElements.more.addEventListener("click", () => this._controlMoreHandler());
  }

  _getTemplate() {
    return `
			<div class="running-control">
        <button class="btn btn--less" data-element="less">убавить</button>
        <button class="btn btn--more" data-element="more">прибавить</button>
      </div>`;
  }
}

const root = document.querySelector(".root");

root.insertAdjacentElement("beforeend", new Wrapper({ type: "running", volume: 3084, goal: 50 }, Counter, Level, Control).element);
