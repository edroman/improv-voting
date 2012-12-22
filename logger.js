var util = require('util');
 
const STACK_FRAME_RE = new RegExp(/at ((\S+)\s)?\(?([^:]+):(\d+):(\d+)/);
const THIS_FILE = __filename.split('/')[__filename.split('/').length - 1];
 
exports.log = function() {

	// Get the function name, module, line, and column of the code that called into this logger.

	var err = new Error();
	Error.captureStackTrace(err);
	
	// Throw away the first line of the trace
	var frames = err.stack.split('\n').slice(1);
	
	// Find the first line in the stack that doesn't name this module.
	var callerInfo = null;
	for (var i = 0; i < frames.length; i++) {
	  if (frames[i].indexOf(THIS_FILE) === -1) {
		callerInfo = STACK_FRAME_RE.exec(frames[i]);
		break;
	  }
	}
	
	var functionName = callerInfo[2] || null;
	var moduleName = callerInfo[3] || null;
	var lineNumber = callerInfo[4] || null;
	var columnNumber = callerInfo[5] || null;
 
	console.log(util.format("%s (%s) line %d: ", moduleName, functionName, lineNumber));
	
	for (var i=0; i < arguments.length; ++i) {
		if (typeof arguments[i] == "string" || (typeof arguments[i] == "object" && arguments[i].constructor === String)) {
			console.log(arguments[i]);
		}
		else {
			console.log(JSON.stringify(arguments[i], null, 4));
		}
	}
};
