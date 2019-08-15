document.querySelector('#input').addEventListener('click', (e)=>{
  e.stopPropagation();
	let t = e.target;
  if ("screen"===t.id || "input"===t.id) { return; }
  
	alert(e.target.className);
});

function Settlement(board,col,row,cn) {
  this.city = false;
  this.player = null;
  this.dom = document.createElement("div");
  this.dom.className = "corner " + (cn?cn:"");
  this.dom.style=`left:calc(50% + (var(--w)*${col})); top:calc(50% + (var(--h)*${row}));`;
  board.appendChild(this.dom);
}
function Road(board,row,col,side) {
	this.player = null;
  this.dom = document.createElement("div");
  this.dom.className = `road row-${row} col-${col} side-${side}`;
  board.appendChild(this.dom);
}
function Territory(board,resource,row,col,number,settlements) {
	this.resource = resource;
  this.number = number;
  this.settlements = settlements.map(i=>settlements[i]);
  
  this.dom_hex = document.createElement('div');
  this.dom_hex.className = `resource ${resource} row-${row} col-${col}`;
  board.appendChild(this.dom_hex);
  
  this.dom_number = document.createElement('DIV');
  this.dom_number.className = `number row-${row} col-${col}`;
  if ("desert"===resource) {
  	this.dom_number.className += " robber";
    this.dom_hex.className += " robber";
  } else {
	  this.dom_number.innerText = number;
  }
  board.appendChild(this.dom_number);
}
function Port(type) {
	this.type = type;
}

// TODO: Randomize
let numbers = [2,3,3,4,4,5,5,6,6,8,8,9,9,10,10,11,11,12];
// TODO: Randomize
let resources = ["wood","wood","wood","wood","sheep","sheep","sheep","sheep","wheat","wheat","wheat","wheat","brick","brick","brick","ore","ore","ore","desert"];

// BUILD THE UI COMPONENTS

let board = document.querySelector('.board');
let i=0;

// Create corners / Settlements
// This is tedious and manual, but oh well
let settlements = [
	new Settlement(board,-3,-7,"port port-n"),
  new Settlement(board,-2,-8,"port port-nw"),
  new Settlement(board,-1,-7),
  new Settlement(board,0,-8,"port port-ne"),
  new Settlement(board,1,-7,"port port-n"),
  new Settlement(board,2,-8),
  new Settlement(board,3,-7),
  
	new Settlement(board,-4,-4,"port port-sw"),
  new Settlement(board,-3,-5),
  new Settlement(board,-2,-4),
  new Settlement(board,-1,-5),
  new Settlement(board,0,-4),
  new Settlement(board,1,-5),
  new Settlement(board,2,-4),
  new Settlement(board,3,-5,"port port-ne"),
  new Settlement(board,4,-4,"port port-n"),
  
	new Settlement(board,-5,-1),
  new Settlement(board,-4,-2,"port port-nw"),
  new Settlement(board,-3,-1),
  new Settlement(board,-2,-2),
  new Settlement(board,-1,-1),
  new Settlement(board,0,-2),
  new Settlement(board,1,-1),
  new Settlement(board,2,-2),
  new Settlement(board,3,-1),
  new Settlement(board,4,-2),
  new Settlement(board,5,-1,"port port-se"),
  
  new Settlement(board,-5,1),
  new Settlement(board,-4,2,"port port-sw"),
  new Settlement(board,-3,1),
  new Settlement(board,-2,2),
  new Settlement(board,-1,1),
  new Settlement(board,0,2),
  new Settlement(board,1,1),
  new Settlement(board,2,2),
  new Settlement(board,3,1),
  new Settlement(board,4,2),
  new Settlement(board,5,1,"port port-ne"),

	new Settlement(board,-4,4,"port port-nw"),
  new Settlement(board,-3,5),
  new Settlement(board,-2,4),
  new Settlement(board,-1,5),
  new Settlement(board,0,4),
  new Settlement(board,1,5),
  new Settlement(board,2,4),
  new Settlement(board,3,5,"port port-se"),
  new Settlement(board,4,4,"port port-s"),
  
	new Settlement(board,-3,7,"port port-s"),
  new Settlement(board,-2,8,"port port-sw"),
  new Settlement(board,-1,7),
  new Settlement(board,0,8,"port port-se"),
  new Settlement(board,1,7,"port port-s"),
  new Settlement(board,2,8),
  new Settlement(board,3,7)  
]

// Create territories
let territories = [
	new Territory(board,resources[0],1,3,numbers[0],[0,1,2,10,9,8]),
  new Territory(board,resources[1],1,5,numbers[1],[2,3,4,12,11,10]),
  new Territory(board,resources[2],1,7,numbers[2],[4,5,6,14,13,12]),
  
  new Territory(board,resources[3],2,2,numbers[3],[7,8,9,19,18,17]),
  new Territory(board,resources[4],2,4,numbers[4],[9,10,11,21,20,19]),
  new Territory(board,resources[5],2,6,numbers[5],[11,12,13,23,22,21]),
  new Territory(board,resources[6],2,8,numbers[6],[13,14,15,25,24,23]),
  
  new Territory(board,resources[7],3,1,numbers[7],[16,17,18,29,28,27]),
  new Territory(board,resources[8],3,3,numbers[8],[18,19,20,31,30,29]),
  new Territory(board,resources[9],3,5,numbers[9],[20,21,22,33,32,31]),
  new Territory(board,resources[10],3,7,numbers[10],[22,23,24,35,34,33]),
  new Territory(board,resources[11],3,9,numbers[11],[24,25,26,37,36,35]),
  
  new Territory(board,resources[12],4,2,numbers[12],[28,29,30,40,39,38]),
  new Territory(board,resources[13],4,4,numbers[13],[30,31,32,42,41,40]),
  new Territory(board,resources[14],4,6,numbers[14],[32,33,34,44,43,42]),
  new Territory(board,resources[15],4,8,numbers[15],[34,35,36,46,45,44]),
  
  new Territory(board,resources[16],5,3,numbers[16],[39,40,41,49,48,47]),
  new Territory(board,resources[17],5,5,numbers[17],[41,42,43,51,50,49]),
  new Territory(board,resources[18],5,7,numbers[18],[43,44,45,53,52,51])
];

let rows = [1,1,1,2,2,2,2,3,3,3,3,3,4,4,4,4,5,5,5];
let cols = [3,5,7,2,4,6,8,1,3,5,7,9,2,4,6,8,3,5,7];
let roads = [];
for (let i=0; i<19; i++) {
	roads.push(new Road(board,rows[i],cols[i],5));
  roads.push(new Road(board,rows[i],cols[i],6));
  roads.push(new Road(board,rows[i],cols[i],1));
}
roads.push(new Road(board,1,7,2));
roads.push(new Road(board,2,8,2));
roads.push(new Road(board,3,9,2));
roads.push(new Road(board,4,8,2));
roads.push(new Road(board,5,7,2));
roads.push(new Road(board,3,1,4));
roads.push(new Road(board,4,2,4));
roads.push(new Road(board,5,3,4));
roads.push(new Road(board,3,9,3));
roads.push(new Road(board,4,8,3));
roads.push(new Road(board,5,7,3));

roads.push(new Road(board,5,3,3));
roads.push(new Road(board,5,5,3));
roads.push(new Road(board,5,5,4));
roads.push(new Road(board,5,7,4));

// Create ports
let ports = [new Port("31"), new Port("31"), new Port("31"), new Port("31"), new Port("wheat"), new Port("sheep"), new Port("ore"), new Port("wood"), new Port("brick")];

