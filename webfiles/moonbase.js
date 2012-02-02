(function($) {
	$.widget("ui.gameboard",
		{
			options: {
				width:10,
				height:10,
				cellClick:function(x,y,cellData) {
				
				}
			},
			_init: function() {
				for(var y=0;y<this.options.height;y++) {
					this.element.append("<tr></tr>");
				}
				
				for(var x=0;x<this.options.width;x++) {
					this.element.find("tr").append("<td></td>");
				}
				var that = this;
				this.element.find("td").click(function() {
					that.options.cellClick($(this).prevAll().size(),$(this).parent().prevAll().size());
				});
			},
			_getCell: function(x,y) {
				return this.element.find("tr:nth-child("+(y+1)+") td:nth-child("+(x+1)+")");
			},
			setCellDisplay:function(x,y,element) {
				this._getCell(x,y).clear().append(element);
			},
			setCellData:function(x,y,data) {
				var gridCell = this._getCell(x,y);
				
				$(gridCell).removeClass();
				
				var gridClass ="";
				if(data.explored == 0) {
					gridClass="unexplored";
				} else if(data.building != "") {
					gridClass = data.building;
				} else {
					gridClass = data.terrain;
				}
				$(gridCell).addClass(gridClass);	
				$(gridCell).data("celldata",data);
			},
			getCellData:function(x,y) {
				return $(this._getCell(x,y)).data("celldata");;
				
			},
			eachCell:function(toExecute) {
				for (var x=0;x<this.options.width;x++) {
					for(var y=0;y<this.options.height;y++) {
						toExecute(x,y);
					}	
				}
			},
			loadGridDisplay: function(gridDisplay) {
				
			},
			loadGridData:function (gridData) {
				var that = this;
				this.eachCell(function(x,y,cell,celldata) {
					that.setCellData(x,y,gridData[x][y]);
				});
			}
		});
})(jQuery);