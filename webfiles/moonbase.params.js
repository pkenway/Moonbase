var gameparams = {
	laserenergycost:50,
	map: {
		width:10,
		height:10,
		randomstart:false,
		startingterrain:"plains",
	//	aliencount:10
	},
	aliens: {
		startingCount:5,//number of tiles with aliens at game start
		growthRate:0.05//chance of growth for each alien tile
	},
	turnCount:60,
	terrain: ["plains","plains","plains","plains","hill","crater","gorge"],
	buildings: {
		ccenter:{cost:40,
			radius:{
				plains:4,
				hill:6,
				crater:3
			}
		},
		solarpanel:{cost:20,
			radius:{
				plains:2,
				hill:3,
				crater:2
			}
		},
		mine:{cost:50,
			income:{
				plains:5,
				hill:10,
				crater:5
			}
		},
		biodome:{cost:50,
			score: {
				plains:2,
				hill:1,
				crater:3
			}
		},
		battery:{cost:20,
			rate: 5
		},
		powerlines:{cost:5}
	}
};