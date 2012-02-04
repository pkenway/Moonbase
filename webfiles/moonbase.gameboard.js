(function($) {
	$.widget("ui.gameboard",
		{
			options: {
				width:10,
				height:10,
				statusMsg:function(text){},
				tryBuy:function(cost){},
				action:function(type){}
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
					var celldata = that.getCellData(coords.x,coords.y);
					if(celldata.canexplore) {
						celldata.explored = 1;
						that.setCellData(coords.x,coords.y,celldata);
						that.updateGrid();
						that.options.action("explore");
					}
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
						
						if(cellData.aliens) {
							statusMsg("Cannot build on a tile with hostile creatures.");
							return;
						}
						//TODO: look up building cost
						if(!that.options.tryBuy(that.options.gameparams.buildings[buildingType].cost)) {
							statusMsg("Not enough money.");
							return;
						}
						if(cellData.terrain=="gorge") {
							statusMsg("Cannot build on in that terrain.");
							return;
						}
						cellData.building = buildingType;
						var coords = that.getCoords(this);
						that.setCellData(coords.x,coords.y,cellData);
						that.updateGrid();
						that.options.action("buy");
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
				} else if(data.aliens == 1){
					gridClass="aliens";
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
				this.updateGrid();
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
			getTilesInRadius:function(src,radius) {
				var tileList = [];
				//2 to 8
				for(var x=src.x - radius;x<=src.x+radius;x++) {
					if(x<0) continue;
					if(x>this.options.width) continue;
					var xDist = Math.abs(src.x - x);
					//6 to 9
					for(var y=src.y - radius;y<=src.y+radius;y++) {
						if(y<0) continue;
						if(y> this.options.height) continue;
						var yDist = Math.abs(src.y - y);
						if(Math.round(Math.sqrt(yDist*yDist + xDist * xDist)) > radius) continue;
						tileList.push({"x":x,"y":y});
					}
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
						//solar panels must be powered
						if(cellData.powered != 1) {
							cellData.powered = 1;
							that.setCellAttribute(x,y,"powered",1);
						}
						//get cells within the radius of the solar panel
						var radius = gameparams.buildings.solarpanel.radius[cellData.terrain];
						var tileList = that.getTilesInRadius({"x":x,"y":y},radius);
						//check N times for cells that are adjacent to a powered cell
						for(var dist=0;dist<radius;dist++) {
							for(var i in tileList) {	
								var checkCellData = that.getCellData(tileList[i].x,tileList[i].y);
								if(checkCellData.powered == 1 || checkCellData.building=="") continue;
								var adjTiles = that.getAdjacentTiles(tileList[i].x,tileList[i].y);
								//check if the tile is adjacent to a powered tile
								for(var a in adjTiles) {
									var aData = that.getCellData(adjTiles[a].x,adjTiles[a].y);
									if(aData.powered==1) {
										that.setCellAttribute(tileList[i].x,tileList[i].y,"powered",1);
										break;
									}
								}
							}
						}
						
						
						/*
						that.matchTilesInRadius({"x":x,"y":y},null,radius,
							function(x,y) {
								if(that.getCellData(x,y).building=="") return false;
								that.setCellAttribute(x,y,"powered",1);
								return true;
							});*/
					}
				});
			},
			checkExplorable:function() {
				var that = this;
				this.eachCell(function(x,y) {
					var cellData = that.getCellData(x,y);
					if(cellData.building=="ccenter") {
						var radius = gameparams.buildings.ccenter.radius[cellData.terrain];
						that.matchTilesInRadius({"x":x,"y":y},null,radius,
							function(x,y) {
								if(that.getCellData(x,y).explored==0) {
									that.setCellAttribute(x,y,"canexplore",1);
								}
								return true;
							});
					}
				});
			},
			updateGrid:function() {
				this.checkPowered();
				this.checkExplorable();
			},
			harvest:function() {
				var that = this;
				var totalMoney = 0;
				//collect money from mines
				this.eachCell(function(x,y) {
					var data = that.getCellData(x,y);
					if(data.building=="mine") {
						if(data.powered == 1) {
							totalMoney += gameparams.buildings.mine.income[data.terrain];
						}
					}
				
				});
				return totalMoney;
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