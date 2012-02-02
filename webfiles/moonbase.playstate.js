(function($) {
	$.widget("ui.playstate",{
		options:{
			state:{money:0,energy:0,turn:0,points:0},
			gameparams:null
		},
		_init:function(){
			this.displayState();
		},
		setState:function(stateData) {
			this.options.state = stateData;
			this.displayState();
		},
		
		displayState:function() {
			this.element.find(".money").html(this.options.state.money);
			this.element.find(".energy").html(this.options.state.energy);
			this.element.find(".turn").html(this.options.state.turn);
			this.element.find(".score").html(this.options.state.score);
		},
		getState:function() {
			return this.options.state;
		},
		nextTurn:function() {
			
		}
	});
})(jQuery);