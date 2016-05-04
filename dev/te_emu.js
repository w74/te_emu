"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/************************************************
*	@name: Te_emu.js
*	@desc: A simple js library that emulates some basic features of a Linux terminal, especially from a visual aspect
*	@author: Wolfram Rong
*	@version: 1.0
*	@license: MPL-2.0
*	@contents:
*		I. Command Class
*			-. Constructor
*			A. Methods
*		II. Te_emu Class
*			-. Constructor
*			A. Methods
*			B. Helper Functions
*		
************************************************/

// I. Command Class

var Command = function () {
	/**
  *  Constructor
  *  @param {Function} defaultFx -> fallback function, or if Command is "flat", the only executed function
  *  @param {Boolean} flat -> if defined, the Command will be "flat" and will only run the default Function
  */

	function Command(_ref) {
		var _this = this;

		var _ref$defaultFx = _ref.defaultFx;
		var defaultFx = _ref$defaultFx === undefined ? function () {
			console.log(_this);
			console.log('default');
		} : _ref$defaultFx;
		var _ref$flat = _ref.flat;
		var flat = _ref$flat === undefined ? false : _ref$flat;

		_classCallCheck(this, Command);

		this.default = defaultFx, this.flat = Boolean(flat);
	}

	// A. Methods

	/**
  * 	Function addOperation
  * 		-> adds an user-defined operation to the command
  *  @param {String} key -> operation name
  *  @param {Function} fx -> function to be executed on operation invokation
  *  @param {Object} flags -> optional flags to alter fx's behavior
  */


	_createClass(Command, [{
		key: "addOperation",
		value: function addOperation(_ref2) {
			var key = _ref2.key;
			var fx = _ref2.fx;
			var flags = _ref2.flags;

			if (this.flat) {
				console.error("Command is flat");
				return;
			} else if (typeof key !== "string") {
				console.error("Invalid: key not of type String");
				return;
			} else if (!(fx instanceof Function)) {
				console.error("Invalid: fx not a Function");
				return;
			} else if (flags) {
				if (!(flags instanceof Object) || flags instanceof Array) {
					console.error("Invalid: flags not of type Object");
					return;
				} else {
					for (var f in flags) {
						if (!/^-{1,2}/.test(f)) {
							console.error("all flags start with either - or --");
							return;
						}
						if (/^-h$|^--help$/.test(f)) {
							console.error("-h and --help are reserved");
							return;
						}
					}
				}
			}

			if (!("operations" in this)) this.operations = {};
			this.operations[key] = {
				'fx': fx,
				'help': function help() {
					console.log(this);
					console.log('helper');
				},
				'flags': flags
			};
		}

		/**
   *  Function invoke
   *  	-> calls an operation and passes variables to it
   *  @param {String} operation -> operation to be called
   *  @param {Array} args -> arguments, Array is in order of user submission
   *  @param {{Array} flags -> flags, Array is in order of user submission
   */

	}, {
		key: "invoke",
		value: function invoke(_ref3) {
			var operation = _ref3.operation;
			var args = _ref3.args;
			var flags = _ref3.flags;

			if (operation && this.operations[operation]) {
				this.operations[operation].fx.call(this, args, flags);
			} else {
				this.default.call(this, args, flags);
			}
		}

		/**
   *  Static Function validate
   *  	-> validates parameters to be of appropriate type and/or value
   *  @return {Boolean} -> true if no errors, false otherwise
   */

	}], [{
		key: "validate",
		value: function validate(_ref4) {
			var key = _ref4.key;
			var defaultFx = _ref4.defaultFx;

			if (typeof key !== "string") {
				console.error("Invalid: key not of type String");
			} else if (typeof defaultFx !== "undefined" && typeof defaultFx !== "function") {
				console.error("Invalid: defaultFx not a Function");
			} else {
				return true;
			}
			return false;
		}
	}]);

	return Command;
}(); // End of Command class

var TE_EMU_DEFAULTS = {
	//v1.0 functionalities -> DOM Elements Integration
	//commandLine: [".teemu-cl", "#teemu-cl"],
	dialogWrapper: "code",
	windows: [".teemu-window", "#teemu-window"]

	//v1.1 functionalities
	//scaffold: automatically add DOM elements to this.window
}; // End of const

// II. Te_emu Class

var Te_emu = function () {
	/**
  *  Constructor
  *  @param {Object} opts -> settings to overwrite default settings
  */

	function Te_emu() {
		var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, Te_emu);

		this.options = this.extend(TE_EMU_DEFAULTS, opts);
		this.commands = {};
	}

	// A. Methods

	/**
  *  Function addCommand
  *  	-> adds a new callable command to the terminal
  *  @param {Object} obj -> object required to construct new Command
  */


	_createClass(Te_emu, [{
		key: "addCommand",
		value: function addCommand(obj) {
			// validates obj type of Object
			if (!(obj instanceof Object) || obj instanceof Array) {
				console.error("addCommand: type Object expected; type " + (typeof obj === "undefined" ? "undefined" : _typeof(obj)) + " received");
			} else {
				if (Command.validate(obj)) {
					this.commands[obj.key] = new Command(obj);
				}
			}
		}

		/**
   *  Function parse
   *  	-> takes user inputted string and prepares it for invokation by Command Object
   *  @param  {String} str -> user input
   */

	}, {
		key: "parse",
		value: function parse(str) {
			var s = str.split(" ");
			var c = s.shift();
			// check if command exists
			if (!this.commands[c]) {
				console.error(c + ": command not found");
				return;
			}
			if (!this.commands[c].flat) {
				var o = s.shift();
			}
			// separate arguments and flags
			var f = [],
			    a = [];
			for (var i = 0; i < s.length; i++) {
				if (/^-{1,2}/.test(s[i])) {
					f.push(s[i]);
				} else {
					a.push(s[i]);
				}
			}
			// send data to Command Object and let it invoke appropriate response
			this.commands[c].invoke({
				operation: o,
				flags: f,
				args: a
			});
		}

		/**
   *	Function print
   * 		-> displays text to all windows as new DOM elements
   *  @param {HTMLString} str -> message to be displayed; allows HTML tags
   */

	}, {
		key: "output",
		value: function output(str) {
			var newElement = document.createElement(this.options.dialogWrapper);
			var newOutput = document.createTextNode(str);
			newElement.appendChild(newOutput);

			var w = document.querySelectorAll(this.options.windows.join());
			for (var i = 0; i < w.length; i++) {
				w[i].insertAdjacentHTML('beforeend', newElement.outerHTML);
			}
		}

		// B. Helper Functions

		/**
   *  Function extend
   *  	-> replicates functionality of $.extends() method
   *  !important -> modifies original values of parameter {a}
   *  @param {Object} a -> object with default values
   *  @param {Object}} b -> object with modifier values
   *  @return {Object} Object a with updated values from Object b
   */

	}, {
		key: "extend",
		value: function (_extend) {
			function extend(_x, _x2) {
				return _extend.apply(this, arguments);
			}

			extend.toString = function () {
				return _extend.toString();
			};

			return extend;
		}(function (a, b) {
			for (var key in a) {
				if (b.hasOwnProperty(key)) {
					if (b[key] instanceof Object && !(b[key] instanceof Array)) {
						extend(a[key], b[key]);
					} else {
						a[key] = b[key];
					}
				}
			}
			return a;
		})
	}]);

	return Te_emu;
}(); // End of Te_emu class