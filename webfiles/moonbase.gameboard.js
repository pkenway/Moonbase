(function($) {
	$.widget("ui.gameboard",
		{
			options: {
				width:10,
				height:10,
				cellClick:function(x,y,cellData) {
				},
				statusMsg:function(text){},
				tryBuy:function(cost){}
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
					var coords = that.getCoords(this);
					that.options.cellClick(coords.x,coords.y);
				}).droppable({
					accept:"img",
					drop:function(event,ui) {
						//get building type
						var buildingType = ui.draggable.attr("title");
						
						var cellData = $(this).data("celldata");
						if(!cellData.explored) {
							statusMsg("Cannot place a building on an unexplored tile");
							return;
						}
						//TODO: look up building cost
						if(!that.options.tryBuy(that.options.gameparams.buildings[buildingType].cost)) {
							statusMsg("Not enough money.");
							return;
						}
						cellData.building = buildingType;
						var coords = that.getCoords(this);
						that.setCellData(coords.x,coords.y,cellData);
						//
					}});
			},
			getCoords: function(cell) {
				var coords = {}
				coords.x = $(cell).prevAll().size();
				coords.y = $(cell).parent().prevAll().size()
				return coords;
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
				if(!data.explored ) {
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
					that.setCellData(x,y,gridData[y][x]);
				});
			},
			getAdjacentTiles:function(x,y) {
				var tileList = [];
				if(y>0) {
					tileList.push({"x":x,"y":y-1});
				}
				if(x>0) {
					tileList.push({"x":x-1,"y":y});
				}
				if(y < this.options.height -1) {
					tileList.push({"x":x,"y":y+1});
				}
				if(x < this.options.width -1) {
					tileList.push({"x":x+1,"y":y});
				}
				return tileList;
			},
			matchTilesInRadius:function(loc,src,radius,onMatch) {
				if(!onMatch(loc.x,loc.y)) return;
				if(radius==0) return;
				var tileList = this.getAdjacentTiles(loc.x,loc.y);
				for(i in tileList) {
					var curr = tileList[i];
					if(src!=null && src.x ==curr.x && src.y==curr.y) {
						continue;
					}
					this.matchTilesInRadius(curr,loc,radius-1,onMatch);
				}
			},
			checkPowered:function() {
				//$(this).find("td").removeClass("powered");
			
				var that = this;
				//find all solar panels and mark them as powered
				this.eachCell(function(x,y) {
					var cellData = that.getCellData(x,y);
					if(cellData.building=="solarpanel") {
						var radius = gameparams.buildings.solarpanel.radius[cellData.terrain];
						that.matchTilesInRadius({"x":x,"y":y},null,radius,
							function(x,y) {
								if(that.getCellData(x,y).building=="") return false;
								that.setCellAttribute(x,y,"powered",1);
								return true;
							});
					}
				});
			},
			setCellAttribute:function(x,y,name,value) {
				var cellData = this.getCellData(x,y);
				cellData[name] = value;
				this.setCellData(x,y,cellData);
				if(name=="powered") {
					if(value==1) {
						this._getCell(x,y).addClass("powered");
					} else {
						this._getCell(x,y).removeClass("powered");
					}
				}
			},
			isCellPowered:function(x,y) {
				var cellData = this.getCellData(x,y);
				return cellData.powered == 1;
			}
		});
})(jQuery);