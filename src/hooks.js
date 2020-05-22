const TextValHook = function(txt) { 
	this.text = txt; 
};

TextValHook.prototype.hook = function(node,prop,previous){
	node.value = this.text || "";
}

module.exports = {
	TextValHook
}