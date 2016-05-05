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
class Command{
	/**
	 *  Constructor
	 *  @param {Function} defaultFx -> fallback function, or if Command is "flat", the only executed function
	 *  @param {Boolean} flat -> if defined, the Command will be "flat" and will only run the default Function
	 */
	constructor(console, {defaultFx = () => {
		if(this.flat)
			this.console.output("Command is flat; no operations attached");
		else{
			this.console.output("Available Operations:");
			this.console.output(Object.keys(this.operations).join(', '));
		}
	}, flat = false}){
		this.default = defaultFx,
		this.flat = Boolean(flat),
		this.console = console
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
	addOperation({key, fx, format, flags}){
		if(this.flat){
			console.error("Command is flat");
		} else if(Command.validateOp({key, fx, format, flags})){
			if(!("operations" in this))
				this.operations = {};
			this.operations[key] = {
				'fx': fx,
				'format': format,
				'help': () => {
					this.console.output([
						"Operation syntax:",
						format + "\r\n" + "-".repeat(24),
						"Available flags:"
					]);
					let fs = [];
					for(let f in this.operations[key].flags)
						fs.push(f + " ".repeat(24 - f.length) + this.operations[key].flags[f]);
					this.console.output(fs);
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
	invoke({key, args, flags}){
		if(key && this.operations[key]){
			if(flags.indexOf("-h") > -1 || flags.indexOf("--help") > -1){
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
	static validate({key, defaultFx}){
		if(typeof key !== "string"){
			console.error("Invalid: key not of type String");
		} else if(typeof defaultFx !== "undefined" && typeof defaultFx !== "function") {
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
	static validateOp({key, fx, format, flags}){
		if(typeof key !== "string"){
			console.error("Invalid: key not of type String");
		} else if(!(fx instanceof Function)){
			console.error("Invalid: fx not a Function");
		} else if(flags && (flags instanceof Object) && !(flags instanceof Array)){
			for(let f in flags){
				if(!/^-{1,2}/.test(f)){
					console.error("all flags start with either - or --");
					return false;
				}
				if(/^-h$|^--help$/.test(f)){
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
} // End of Command class

const TE_EMU_DEFAULTS = {
	//v1.0 functionalities -> DOM Elements Integration
	//commandLine: [".teemu-cl", "#teemu-cl"],
	dialogWrapper: "code", 
	windows: [".teemu-window", "#teemu-window"]
	
	//v1.1 functionalities
	//scaffold: automatically add DOM elements to this.window
}; // End of const

// II. Te_emu Class
class Te_emu{
	/**
	 *  Constructor
	 *  @param {Object} opts -> settings to overwrite default settings
	 */
	constructor(opts = {}){
		this.options = Te_emu.extend(TE_EMU_DEFAULTS, opts);
		this.commands = {};
	}

	// A. Methods

	/**
	 *  Function addCommand
	 *  	-> adds a new callable command to the terminal
	 *  @param {Object} obj -> object required to construct new Command
	 */
	addCommand(obj){
		// validates obj type of Object
		if(!(obj instanceof Object) || (obj instanceof Array)){
			console.error("addCommand: type Object expected; type " + typeof obj + " received");
		} else {
			if(Command.validate(obj)){
				this.commands[obj.key] = new Command(this, obj);
			}
		}
	}

	/**
	 *  Function parse
	 *  	-> takes user inputted string and prepares it for invokation by Command Object
	 *  @param  {String} str -> user input
	 */
	parse(str){
		let s = str.split(" ");
		var c = s.shift();
		// check if command exists
		if(!this.commands[c]){
			this.output(c + ": command not found");
			return;
		}
		if(!this.commands[c].flat){
			var o = s.shift();
		}
		// separate arguments and flags
		let f = [], a = [];
		for(let i = 0; i < s.length; i++){
			if(/^-{1,2}/.test(s[i])){
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
	output(str){
		if(typeof str === "string"){
			var str = [str];
		}
		let w = document.querySelectorAll(this.options.windows.join());

		for(let i = 0; i < str.length; i++){
			let newElement = document.createElement(this.options.dialogWrapper);
			let newOutput = document.createTextNode(str[i]);
			newElement.appendChild(newOutput);

			for(let j = 0; j < w.length; j++){
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
	static extend(a, b){
		for(let key in a){
			if(b.hasOwnProperty(key)){
				if((b[key] instanceof Object) && !(b[key] instanceof Array)){
					extend(a[key], b[key]);
				} else {
					a[key] = b[key];
				}
			}
		}
		return a;
	}
} // End of Te_emu class