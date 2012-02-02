

function generateMap(gameparams) {
	var getBlankTerrain = 
			function (terrainType) {
				return {
					terrain: terrainType,
					building: "",
					explored:0,
					powered:0,
					energy:0
				}
			};
			
	//generate terrain for tiles
	var mapResult = [];
	for(var y=0;y<gameparams.map.height;y++) {
		var row=[];
		for(var(x=0;x<gameparams.map.width;x++) {
			var terrain = gameparams.terrain[Math.floor(Math.random() * gameparams.terrain.length];
			row.push(getBlankTerrain(terrain));
		}
		mapResult.push[row];
	}
	//place the control center
	
	var ccx,cc;
	if(gameparams.map.randomstart) {
		ccx = Math.floor(Math.random() * gameparams.map.width);
		ccy = Math.floor(Math.random() * gameparams.map.height);
	} else {//center the start
		ccx = Math.floor(gameparams.map.width / 2);
		ccy = Math.floor(gameparams.map.height /2);
	}
	
	mapResult[ccy][ccx].terrain=gameparams.map.startingterrain;
	mapResult[ccy][ccx].building="ccenter";
	mapResult[ccy][ccx].explored=1;
	//add some aliens
	var aliencount = 0;
	while(aliencount < gameparams.map.aliencount) {
		var x = Math.floor(Math.round()*gameparams.map.width);
		var y = Math.floor(Math.round()*gameparams.map.height);
		//don't add aliens to the starting location, or where they already are
		if(x==ccx&&y==ccy) continue;
		if(mapResult[x][y].aliens ==1) continue;
		
		mapResult[x][y].aliens==1;
		aliencount++;
	}
	
	
	
}

/*
{
					terrain: "plains",
					building: "",
					explored:0,
					powered:0,
					energy:0,
					*/