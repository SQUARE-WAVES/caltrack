const TextValHook = function(txt) { 
	this.text = txt; 
};

TextValHook.prototype.hook = function(node,prop,previous){
	node.value = this.text || "";
}

const FocusHook = function() {

}

FocusHook.prototype.hook = function(node,prop,previous){
	node.focus();
	setTimeout(() => node.focus(),0);
}

FocusHook.instance = new FocusHook();

module.exports = {
	TextValHook,
	FocusHook
}