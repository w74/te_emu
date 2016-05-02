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
*		II. Te_emu Class
*			-. Constructor
*			A. Getters & Setters
*			B. Methods
*			C. Helper Functions
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
		} : _ref$defaultFx;
		var _ref$flat = _ref.flat;
		var flat = _ref$flat === undefined ? false : _ref$flat;

		_classCallCheck(this, Command);

		this.default = defaultFx, this.flat = Boolean(flat);
	}

	/**
  *  Static Function validate
  *  	-> validates parameters to be of appropriate type and/or value
  *  @return {Boolean} -> true if no errors, false otherwise
  */


	_createClass(Command, null, [{
		key: "validate",
		value: function validate(_ref2) {
			var key = _ref2.key;
			var defaultFx = _ref2.defaultFx;

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
}();

// II. Te_emu Class


var TE_EMU_DEFAULTS = {
	//v1.0 functionalities -> DOM Elements Integration
	//commandLine: [".teemu-cl", "#teemu-cl"],
	dialogWrapper: "code",
	windows: [".teemu-window", "#teemu-window"]

	//v1.1 functionalities
	//scaffold: automatically add DOM elements to this.window
};

var Te_emu = function () {
	function Te_emu() {
		var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, Te_emu);

		this.options = this.extend(TE_EMU_DEFAULTS, opts);
		this.commands = {};
	}

	// B. Methods

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
   * 	Function addOperation
   * 		-> adds an operation associated with a command
   * 	@param {String} cName -> command name
   *  @param {String} key -> operation name
   *  @param {Function} fx -> function to be executed on operation invokation
   *  @param {Object} flags -> optional flags to alter fx's behavior
   */

	}, {
		key: "addOperation",
		value: function addOperation(cName, _ref3) {
			var key = _ref3.key;
			var fx = _ref3.fx;
			var flags = _ref3.flags;

			// Check if the method is properly defined with a name and executable function
			try {
				if (!(cName in this.commands)) throw "no command by that name";
				if (typeof key !== "string") throw "key (type String)";
				if (!(fx instanceof Function)) throw "fx (type Function)";

				if (typeof flags !== "undefined") {
					if (!(flags instanceof Object) || flags instanceof Array) throw "flags (type Object)";else {
						for (var f in flags) {
							if (!/^-{1,2}/.test(f)) throw "flag `" + f + "` needs to begin with either - or --";
							if (/^-h$|^--help$/.test(f)) throw "-h and --help flags are reserved and immutable";
						}
					}
				}
			} catch (e) {
				console.error('Invalid/Missing:', e);
			}
			// Create the .ops Object if none exists
			if (typeof this.commands[cName].ops === "undefined") this.commands[cName].ops = {};
			var c = this.commands[cName].ops;
			c[key] = {
				'f': fx,
				'help': function help() {
					console.log(this);
				}
			};
			if (typeof flags !== "undefined") {
				c[key].flags = flags;
			}
		}
	}, {
		key: "invoke",
		value: function invoke(str) {
			var s = str.split(" ");
			// try{
			// 	if(!(s[0] in this.commands)) throw s[0] + ": command not found";
			// }
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

		// C. Helper Functions

		/**
   *  Function extend
   *  	-> replicates functionality of $.extends() method
   *  @!important -> modifies original values of parameter {a}
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
	}, {
		key: "printFlags",
		value: function printFlags() {}
	}]);

	return Te_emu;
}();