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
class Command{
	/**
	 *  Constructor
	 *  @param {Function} defaultFx -> fallback function, or if Command is "flat", the only executed function
	 *  @param {Boolean} flat -> if defined, the Command will be "flat" and will only run the default Function
	 */
	constructor({defaultFx = () => {
			console.log(this);
		}, flat = false}){
		this.default = defaultFx,
		this.flat = Boolean(flat)
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

}

// II. Te_emu Class
const TE_EMU_DEFAULTS = {
	//v1.0 functionalities -> DOM Elements Integration
	//commandLine: [".teemu-cl", "#teemu-cl"],
	dialogWrapper: "code", 
	windows: [".teemu-window", "#teemu-window"]
	
	//v1.1 functionalities
	//scaffold: automatically add DOM elements to this.window
};

class Te_emu{
	constructor(opts = {}){
		this.options = this.extend(TE_EMU_DEFAULTS, opts);
		this.commands = {};
	}

	// B. Methods
	
	addCommand(obj){
		// validates obj type of Object
		if(!(obj instanceof Object) || (obj instanceof Array)){
			console.error("addCommand: type Object expected; type " + typeof obj + " received");
		} else {
			if(Command.validate(obj)){
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
	addOperation(cName, {key, fx, flags}){
		// Check if the method is properly defined with a name and executable function
		try{
			if(!(cName in this.commands)) throw "no command by that name";
			if(typeof key !== "string") throw "key (type String)";
			if(!(fx instanceof Function)) throw "fx (type Function)";

			if(typeof flags !== "undefined"){
				if(!(flags instanceof Object) || (flags instanceof Array)) throw "flags (type Object)";
				else{ 
					for(let f in flags){
						if(!/^-{1,2}/.test(f)) throw "flag `" + f + "` needs to begin with either - or --";
						if(/^-h$|^--help$/.test(f)) throw "-h and --help flags are reserved and immutable";
					}
				}
			}
		} catch(e) {
			console.error('Invalid/Missing:', e);
		}
		// Create the .ops Object if none exists
		if(typeof this.commands[cName].ops === "undefined")
			this.commands[cName].ops = {};
		var c = this.commands[cName].ops;
		c[key] = {
			'f': fx,
			'help': function(){
				console.log(this);
			}
		};
		if(typeof flags !== "undefined"){
			c[key].flags = flags;
		}
	}


	invoke(str){
		let s = str.split(" ");
		// try{
		// 	if(!(s[0] in this.commands)) throw s[0] + ": command not found";
		// }
	}

	/**
	 *	Function print
	 * 		-> displays text to all windows as new DOM elements
	 *  @param {HTMLString} str -> message to be displayed; allows HTML tags
	 */
	output(str){
		let newElement = document.createElement(this.options.dialogWrapper);
		let newOutput = document.createTextNode(str);
		newElement.appendChild(newOutput);

		let w = document.querySelectorAll(this.options.windows.join());
		for(var i = 0; i < w.length; i++){
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
	extend(a, b){
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

	printFlags(){}
}