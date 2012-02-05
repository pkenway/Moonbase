var gameparams = {
	laserenergycost:50,
	map: {
		width:10,
		height:10,
		randomstart:false,
		startingterrain:"plains",
		artifactcount:5
	//	aliencount:10
	},
	aliens: {
		startingCount:5,//number of tiles with aliens at game start
		growthRate:0.055//chance of growth for each alien tile
	},
	turnCount:75,
	terrain: ["plains","plains","plains","plains","hill","crater","gorge"],
	buildings: {
		ccenter:{cost:40,
			title: "Control Center",
			description: "Allows you to scan nearby unexplored squares.",
			radius:{
				plains:4,
				hill:6,
				crater:3
			}
		},
		solarpanel:{cost:20,
			title: "Solar Panel",
			description: "Generates power for nearby buildings.",
			radius:{
				plains:2,
				hill:3,
				crater:2
			}
		},
		mine:{cost:50,
			title:"Mine",
			description:"Generates income.",
			income:{
				plains:5,
				hill:10,
				crater:5
			}
		},
		biodome:{cost:50,
			title:"Bio Dome",
			description: "Hosts your population.  The more biodomes you have, the more points you get.",
			score: {
				plains:2,
				hill:1,
				crater:3
			}
		},
		battery:{cost:20,
			title:"Battery",
			description:"Builds up charge so you can fire your laser cannon at hostile life forms.",
			rate: 5
		},
		powerlines:{cost:20,
			title:"Power Lines",
			description:"Connects buildings to one another so you can power them up."}
	},
	artifacts: [
		{
			name:"Twisted Portal",
			description:"This strange artifact temporarily reverses the flow of time!",
			value :{
				turns:10
			}
		},
		{
			name:"Glowing Crystal",
			description:"This object stores a massive amount of energy!",
			value :{
				energy:100
			}
		},
		{
			name:"Super-Alloys",
			description: "This wondrous material is worth a fortune!",
			value: {
				money:200
			}
		},
		{
			name:"Tablet of Forgotten Knowledge",
			description:"We've deciphered the inscriptions, and unlocked the secrets of the universe!",
			value :{
				score:200
			}
		},
		{
			name:"Astral Projection Device",
			description: "When you grasp this shimmering orb, your mind leaves your body and files around the area!",
			value:{
				explored_tiles:10
			}
		}
	]
};