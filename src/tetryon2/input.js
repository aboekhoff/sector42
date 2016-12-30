export default function Input() {
  this.ports = {
    MOUSE: {x: null, y: null}
  };
  this.buttons = {};
  this.buttonList = [];
  this.pointers = {};
  this.pointerList = [];
  this.add = new InputMethodFactory(this);
}

function InputMethodFactory(input) {
  this.input = input;
}

InputMethodFactory.prototype.button = function(name, port) {
  var button = new Button('' + port);
  this.input.buttons[name] = button;
  this.input.buttonList.push(button);
  return button;
}

InputMethodFactory.prototype.pointer = function(name, port) {
  var pointer = new Pointer('' + port);
  this.input.pointers[name] = pointer;
  this.input.pointerList.push(pointer);
  return pointer;
}

Input.prototype.update = function() {
  for (var i=0, ii=this.buttonList.length; i<ii; i++) {
    this.buttonList[i].update(this.ports);
  }
  for (var i=0, ii=this.pointerList.length; i<ii; i++) {
    this.pointerList[i].update(this.ports);
  }
}

function Button(port) {
  this.port = port;
  this.lastState = false;
  this.state = false;
}

Button.prototype.update = function(ports) {
  this.lastState = this.state;
  this.state = ports[this.port];
}

// permit abstractions of button and pointer inputs

Button.prototype.isDown = function() {
  return this.state;
}

Button.prototype.justPressed = function() {
  return this.lastState = false && this.state == true;
}

Button.prototype.justReleased = function() {
  return this.lastState = true && this.state == false;
}

function Pointer(port) {
  this.port = port;
  this.lastPosition = {x: 0, y: 0};
  this.position = {x: 0, y: 0};
}


Pointer.prototype.update = function(ports) {
  this.lastPosition.x = this.position.x;
  this.lastPosition.y = this.position.y;
  this.position.x = ports[this.port].x;
  this.position.y = ports[this.port].y;
}


var Keyboard = {};

Keyboard.BACKSPACE = 8;
Keyboard.TAB = 9;
Keyboard.ENTER = 13;
Keyboard.SHIFT = 16;
Keyboard.CTRL = 17;
Keyboard.ALT = 18;
Keyboard.BREAK = 19;
Keyboard.CAPS_LOCK = 20;
Keyboard.ESC = 27;
Keyboard.PAGE_UP = 23;
Keyboard.PAGE_DOWN = 34;
Keyboard.END = 35;
Keyboard.HOME = 36;
Keyboard.LEFT = 37;
Keyboard.UP = 38;
Keyboard.RIGHT = 39;
Keyboard.DOWN = 40;
Keyboard.INSERT = 45;
Keyboard.DELETE = 46;
Keyboard.LEFT_WINDOW = 91;
Keyboard.RIGHT_WINDOW = 92;
Keyboard.ADD = 107;
Keyboard.SUBTRACT = 107;
Keyboard.DECIMAL_POINT = 107;
Keyboard.DIVIDE = 107;
Keyboard.NUM_LOCK = 145;
Keyboard.SEMICOLON = 186;
Keyboard.EQUALS = 187;
Keyboard.COMMA = 188;
Keyboard.DASH = 189;
Keyboard.PERIOD = 190;
Keyboard.SLASH = 191;
Keyboard.OPEN_BRACKET = 219;
Keyboard.BACKSLASH = 220;
Keyboard.CLOSE_BRACKET = 221;
Keyboard.SINGLE_QUOTE = 222;

Keyboard.codeToString = function(code) {
  for (var v in Keyboard) {
    if (code == Keyboard[v]) {
      return v;
    }
  }
}

// function keys
for (var i=0; i<=12; i++) {
  Keyboard['F' + i] = 112 + i;
}

// numbers and numpad
for (var i=0; i<=9; i++) {
  Keyboard[i] = '' + (i + 48);
  Keyboard['NUMPAD_' + i] = i + 96;
}

// letters
for (var i='A'.charCodeAt(0); i<'Z'.charCodeAt(0); i++) {
  Keyboard[String.fromCharCode(i)] = i;
}

// register event handlers
// should mouse events bind to screen or to window?
// not sure, more investigation may be required
// potential advantages to both

Input.prototype.addCallbacks = function() {
  var input = this;

  function stopEvent(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  window.onkeydown = function(e) {
    input.ports[e.which] = true;
    return stopEvent(e);
  }

  window.onkeyup = function(e) {
    input.ports[e.which] = false;
    return stopEvent(e);
  }

  window.onmousemove = function(e) {
    input.ports['MOUSE'] = { x: e.clientX, y: e.clientY };
    return stopEvent(e);
  }

  window.onmousedown = function(e) {
    switch (e.button) {
      case 0: input.ports['MOUSE_0'] = true;
      case 1: input.ports['MOUSE_1'] = true;
      case 2: input.ports['MOUSE_2'] = true;
    }
    return stopEvent(e);
  }

  window.onmouseup = function(e) {
    switch (e.button) {
      case 0: input.ports['MOUSE_0'] = false;
      case 1: input.ports['MOUSE_1'] = false;
      case 2: input.ports['MOUSE_2'] = false;
    }
    return stopEvent(e);
  }

  window.oncontextmenu = function(e) {
    return stopEvent(e);
  }
}

Input.Keyboard = Keyboard;
Input.Mouse = {
  toString: function() { return 'MOUSE' },
  LEFT_BUTTON: 'MOUSE_0',
  MIDDLE_BUTTON: 'MOUSE_1',
  RIGHT_BUTTON: 'MOUSE_2'
};