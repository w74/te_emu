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

	function Command(console, _ref) {
		var _this = this;

		var _ref$defaultFx = _ref.defaultFx;
		var defaultFx = _ref$defaultFx === undefined ? function () {
			if (_this.flat) _this.console.output("Command is flat; no operations attached");else {
				_this.console.output("Available Operations:");
				_this.console.output(Object.keys(_this.operations).join(', '));
			}
		} : _ref$defaultFx;
		var _ref$flat = _ref.flat;
		var flat = _ref$flat === undefined ? false : _ref$flat;

		_classCallCheck(this, Command);

		this.default = defaultFx, this.flat = Boolean(flat), this.console = console;
	}

	// A. Methods

	/**
  * 	Function addOperation
  * 		-> adds an user-defined operation to the command
  *  @param {String} key -> operation name
  *  @param {Function} fx -> function to execute for operation
  *  @param {String} format -> reference to call this operation
  *    ex. "command operation <argument(s)> [flag(s)]"
  *  @param {Object} flags -> optional flags to alter fx's behavior
  */


	_createClass(Command, [{
		key: "addOperation",
		value: function addOperation(_ref2) {
			var _this2 = this;

			var key = _ref2.key;
			var fx = _ref2.fx;
			var format = _ref2.format;
			var flags = _ref2.flags;

			if (this.flat) {
				console.error("Command is flat");
			} else if (Command.validateOp({ key: key, fx: fx, format: format, flags: flags })) {
				if (!("operations" in this)) this.operations = {};
				this.operations[key] = {
					'fx': fx,
					'format': format,
					'help': function help() {
						_this2.console.output(["Operation syntax:", format + "\r\n" + "-".repeat(24), "Available flags:"]);
						var fs = [];
						for (var f in _this2.operations[key].flags) {
							fs.push(f + " ".repeat(24 - f.length) + _this2.operations[key].flags[f]);
						}_this2.console.output(fs);
					},
					'flags': flags
				};
			}
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
			var key = _ref3.key;
			var args = _ref3.args;
			var flags = _ref3.flags;

			if (key && this.operations[key]) {
				if (flags.indexOf("-h") > -1 || flags.indexOf("--help") > -1) {
					this.operations[key].help();
				} else {
					this.operations[key].fx.call(this, args, flags);
				}
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

		/**
   *  Function validateOp
   *  	-> validates arguments to be added to a new Operation
   *  @param {String} key -> operation name
   *  @param {Function} fx -> function to execute for operation
   *  @param {String} format -> reference to call this operation
   *    ex. "command operation <argument(s)> [flag(s)]"
   *  @param {Object} flags -> optional flags to alter fx's behavior
   *  @return {Boolean} -> returns true if valid, false otherwise
   */

	}, {
		key: "validateOp",
		value: function validateOp(_ref5) {
			var key = _ref5.key;
			var fx = _ref5.fx;
			var format = _ref5.format;
			var flags = _ref5.flags;

			if (typeof key !== "string") {
				console.error("Invalid: key not of type String");
			} else if (!(fx instanceof Function)) {
				console.error("Invalid: fx not a Function");
			} else if (flags && flags instanceof Object && !(flags instanceof Array)) {
				for (var f in flags) {
					if (!/^-{1,2}/.test(f)) {
						console.error("all flags start with either - or --");
						return false;
					}
					if (/^-h$|^--help$/.test(f)) {
						console.error("-h and --help are reserved");
						return false;
					}
				}
				return true;
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

		this.options = Te_emu.extend(TE_EMU_DEFAULTS, opts);
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
					this.commands[obj.key] = new Command(this, obj);
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
				this.output(c + ": command not found");
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
				key: o,
				flags: f,
				args: a
			});
		}

		/**
   *	Function output
   * 		-> displays text to all windows as new DOM elements
   *  @param {String|Array} str -> message(s) to be displayed; allows HTML tags and entities
   */

	}, {
		key: "output",
		value: function output(str) {
			if (typeof str === "string") {
				var str = [str];
			}
			var w = document.querySelectorAll(this.options.windows.join());

			for (var i = 0; i < str.length; i++) {
				var newElement = document.createElement(this.options.dialogWrapper);
				var newOutput = document.createTextNode(str[i]);
				newElement.appendChild(newOutput);

				for (var j = 0; j < w.length; j++) {
					w[j].insertAdjacentHTML('beforeend', newElement.outerHTML);
				}
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

	}], [{
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