(function($) {
	$.widget("ui.gameboard",
		{
			options: {
				width:10,
				height:10,
				statusMsg:function(text){},
				tryBuy:function(cost){},
				tryFireLaser:function(){},
				action:function(type){},
				artifactFound:function(artifact){}
			},
			_init: function() {
				this.interfaceMode = "default";
				for(var y=0;y<this.options.height;y++) {
					this.element.append("<tr></tr>");
				}
				
				for(var x=0;x<this.options.width;x++) {
					this.element.find("tr").append("<td></td>");
				}
				var that = this;
				this.element.find("td").click(function() {
					var coords = that.getCoords(this);
					switch(that.interfaceMode) {
						case "laser":
							that.interfaceMode="default";
							var data = that.getCellData(coords.x,coords.y);
							if(!data.explored) {
								statusMsg("Unable to aquire target.  Scan target location first.");
								return;
							}
							if(!data.aliens) {
								statusMsg("No hostiles detected");
								return;
							}
							if(!that.options.tryFireLaser()) {
								statusMsg("Not enough energy.");
								return;
							}
							data.aliens =0;
							that.setCellData(coords.x,coords.y,data);
							statusMsg("Hostile life forms eradicated");
							if(data.artifact) {
								that.options.artifactFound(data.artifact);
							}
							that.options.action("laser");
							
							break;
						default:
							var celldata = that.getCellData(coords.x,coords.y);
							if(celldata.canexplore) {
								celldata.explored = 1;
								that.setCellData(coords.x,coords.y,celldata);
								if(celldata.aliens==1) {
									statusMsg("Hostile life forms detected");
								} else if(celldata.artifact !=null) {
									that.options.artifactFound(celldata.artifact);
								}
								that.options.action("explore");
							}
					}
				}).droppable({
					accept:"img",
					drop:function(event,ui) {
						//get building type
						var buildingType = ui.draggable.attr("title");
						var coords = that.getCoords(this);
						
						var cellData = that.getCellData(coords.x,coords.y);
						if(!cellData.explored) {
							statusMsg("Cannot place a building on an unexplored tile");
							return;
						}
						
						if(cellData.aliens) {
							statusMsg("Cannot build on a tile with hostile creatures.");
							return;
						}
						
						if(!that.options.tryBuy(that.options.gameparams.buildings[buildingType].cost)) {
							statusMsg("Not enough money.");
							return;
						}
						if(cellData.terrain=="gorge" && buildingType != "powerlines") {
							statusMsg("Cannot build on in that terrain.");
							return;
						}
						cellData.building = buildingType;
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
			setInterfaceMode:function(mode) {
				this.interfaceMode = mode;
			},
			setCellDisplay:function(x,y) {
				var data = this.getCellData(x,y);
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
				if(data.powered) {
					$(gridCell).addClass("powered");
				}
			},
			setCellData:function(x,y,data) {
				this.gridData[y][x] = data;
				this.setCellDisplay(x,y);
			},
			getCellData:function(x,y) {
				return this.gridData[y][x];
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
				this.gridData = gridData;
				this.eachCell(function(x,y,cell,celldata) {
					that.setCellDisplay(x,y);
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
					if(x>=this.options.width) continue;
					var xDist = Math.abs(src.x - x);
					//6 to 9
					for(var y=src.y - radius;y<=src.y+radius;y++) {
						if(y<0) continue;
						if(y>= this.options.height) continue;
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
				var that = this;
				$(this).find("td").removeClass("powered");
				this.eachCell(function(x,y) {
					that.setCellAttribute(x,y,"powered",0);
				});
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
					}
				});
			},
			checkExplorable:function() {
				var that = this;
				this.eachCell(function(x,y) {
					var cellData = that.getCellData(x,y);
					if(cellData.building=="ccenter") {
						var radius = gameparams.buildings.ccenter.radius[cellData.terrain];
						var tileList = that.getTilesInRadius({"x":x,"y":y},radius);
						for(var i=0;i<tileList.length;i++) {
							var tX = tileList[i].x;
							var tY = tileList[i].y;
							if(that.getCellData(tX,tY).explored==0) {
								that.setCellAttribute(tX,tY,"canexplore",1);
							}
						}
					}
				});
			},
			updateGrid:function() {
				this.checkPowered();
				this.checkExplorable();
			},
			harvest:function() {
				var that = this;
				var resourcesCollected = { money:0,energy:0,score:0};
				//var totalMoney = 0;
				//collect player income
				this.eachCell(function(x,y) {
					var data = that.getCellData(x,y);
					switch(data.building) {
						case "mine":
							if(data.powered == 1) {
								resourcesCollected.money += gameparams.buildings.mine.income[data.terrain];
							}
							break;
						case "battery":
							if(data.powered ==1) {
								resourcesCollected.energy += gameparams.buildings.battery.rate;
							}
							break;
						case "biodome":
							if(data.powered ==1) {
								resourcesCollected.score += gameparams.buildings.biodome.score[data.terrain];
							}
							break;
					}
				});
				
				//do alien growth
				this.eachCell(function(x,y) {
					var data = that.getCellData(x,y);
					if(data.aliens ==1) {
						if(Math.random() < that.options.gameparams.aliens.growthRate) {
							//what direction do they grow
							var direction = Math.floor((Math.random()*4));
							var tileToInfest = {"x":x,"y":y};
							switch(direction) {
								case 0:
									tileToInfest.x--;
									break;
								case 1:
									tileToInfest.x++;
									break;
								case 2:
									tileToInfest.y--;
									break;
								case 3:
									tileToInfest.y++;
									break;
							}
							
							if(tileToInfest.x>=0 &&
								tileToInfest.x<that.options.width &&
								tileToInfest.y>=0 &&
								tileToInfest.y < that.options.height) {
								
								var newCellData = that.getCellData(tileToInfest.x,tileToInfest.y);
								if(newCellData.building != "") {
									statusMsg("Hostile life forms have damaged our base.");
									newCellData.building = "";
									newCellData.powered = 0;
								}
								newCellData.aliens = 1;
								that.setCellData(tileToInfest.x,tileToInfest.y,newCellData);
								that.updateGrid();
							}
						
						}
					}
				});
				
				return resourcesCollected;
			},
			setCellAttribute:function(x,y,name,value) {
				var cellData = this.getCellData(x,y);
				try {
					cellData[name] = value;
					this.setCellData(x,y,cellData);
				} catch(ex) {
					alert("error setting property " + name + " at grid space : "+x+","+y);
				}
			},
			isCellPowered:function(x,y) {
				var cellData = this.getCellData(x,y);
				return cellData.powered == 1;
			},
			exploreAll:function() {
				var that = this;
				this.eachCell(function(x,y) {
					that.setCellAttribute(x,y,"explored",1);
				});
			},
			randomExplore:function(count) {
				var attempts = 0;
				var explored = 0;
				while(explored < count && attempts < (this.options.width * this.options.height)) {
					attempts++;
					var x = Math.floor(Math.random()*this.options.width);
					var y = Math.floor(Math.random()*this.options.height);
					var cellData = this.getCellData(x,y);
					if(cellData.explored == 1) continue;
					this.setCellAttribute(x,y,"explored",1);
					explored++;
				}
			}
		});
})(jQuery);