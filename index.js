let mode = null;
let html = document.querySelector('html');
let message = document.querySelector('.message');
let handler = {};
let active_color = null;
let colors=["red","white","blue","orange"];
function update_piece_counts() {
  colors.forEach(c=>{
    document.querySelector(`.player-panel-${c} .pieces div[mode="placeroad"] .count`).innerText = 15 - document.querySelectorAll(`.board .road.${c}`).length;
    document.querySelector(`.player-panel-${c} .pieces div[mode="placesettlement"] .count`).innerText = 5 - document.querySelectorAll(`.board .settlement.${c}`).length;
    document.querySelector(`.player-panel-${c} .pieces div[mode="placecity"] .count`).innerText = 4 - document.querySelectorAll(`.board .city.${c}`).length;
  });
}
function setmode(m) {
  mode = m;
  html.setAttribute('mode',m);
}
function clearmode() {
  mode = null;
  html.setAttribute('mode','');
  clearmessage();
}
function clearmessage() {
  message.innerText = "";
  message.style.display="none";
}
function setmessage(msg) {
  message.innerHTML = msg;
  message.style.display="block";
}
function setcolor(c) {
  active_color = c;
  html.setAttribute('color',c);
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

document.querySelector('#input').addEventListener('click', (e)=>{
  e.stopPropagation();
	let c,mode,msg,t = e.target;
	if ("screen"===t.id || "input"===t.id) { return; }
  while (t && t.tagName!=="BODY") {
    mode = t.getAttribute('mode');
    msg = t.getAttribute('message');
    c = t.getAttribute('color');
    if (mode || msg) { break; }
    t = t.parentNode;
  }
    if (msg) {
      setmessage(msg);
    }
    else {
      clearmessage();
    }
    if (c) {
      active_color = c;
    }
    if (mode !== null) {

      if (typeof handler[mode] === "function") {
        let newmode = handler[mode](t, mode);
        if (typeof newmode==="string" || newmode===null) {
          mode = newmode;
        }
      }
      if (mode) {
        setmode(mode);
      }
      else {
        clearmode();
      }
    } else {
      clearmode();
    }
});

let settlement_index=0;
function Settlement(board,col,row,cn) {
  this.city = false;
  this.player = null;
  this.dom = document.createElement("div");
  this.dom.className = "corner " + (cn?cn:"");
  this.dom.style=`left:calc(50% + (var(--w)*${col})); top:calc(50% + (var(--h)*${row}));`;
  this.dom.setAttribute('mode','selectcorner');
  this.dom.setAttribute('index',settlement_index++);
  board.appendChild(this.dom);
}
function Road(board,row,col,side) {
	this.player = null;
  this.dom = document.createElement("div");
  this.dom.className = `road row-${row} col-${col} side-${side}`;
  this.dom.setAttribute('mode','selectroad');
  board.appendChild(this.dom);
}
function Port(type) {
	this.type = type;
}

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
];

// Create territories
let resources = shuffle(["wood","wood","wood","wood","sheep","sheep","sheep","sheep","wheat","wheat","wheat","wheat","brick","brick","brick","ore","ore","ore","desert"]);

i=0;
let numbers = shuffle([2,3,3,4,4,5,5,6,6,8,8,9,9,10,10,11,11,12]);
// Make sure layout is valid
function is_valid_board() {
  let nums = JSON.parse(JSON.stringify(numbers));
  let desert_index = resources.indexOf("desert");
  nums.splice(desert_index,0,-1);
  let pairs = [
    /*
          00  01  02
        03  04  05  06
      07  08  09  10  11
        12  13  14  15
          16  17  18
     */
    // side by side
    0,1, 1,2,
    3,4, 4,5, 5,6,
    7,8, 8,9, 9,10, 10,11,
    12,13, 13,14, 14,15,
    16,17, 17,18,
    // below
    0,3, 0,4, 1,4, 1,5, 2,5, 2,6,
    3,7, 3,8, 4,8, 4,9, 5,9, 5,10, 6,10, 6,11,
    7,12, 8,12, 8,13, 9,13, 9,14, 10,14, 10,15, 11,15,
    12,16, 13,16, 13,17, 14,17, 14,18, 15,18
  ];
  for (let i=0; i<pairs.length; i+=2) {
    if ((nums[pairs[i]]===6 || nums[pairs[i]]===8) && (nums[pairs[i+1]]===6 || nums[pairs[i+1]]===8)) {
      //console.log("Invalid Board!");
      //console.log(nums);
      //console.log(`For positions ${pairs[i]}, ${pairs[i+1]}`);
      return false;
    }
  }
  //console.log("Found valid board");
  //console.log(nums);
  return true;
}
while (!is_valid_board()) {
  numbers = shuffle(numbers);
}
let t_num=0;
function Territory(board,row,col,tsettlements) {
  this.resource = resources.shift();
  this.number = this.resource === "desert" ? null : numbers.shift();
  this.settlements = tsettlements.map(i=>settlements[i]);

  this.dom_hex = document.createElement('div');
  this.dom_hex.className = `resource ${this.resource} row-${row} col-${col}`;
  board.appendChild(this.dom_hex);

  this.dom_number = document.createElement('DIV');
  this.dom_number.className = `number row-${row} col-${col}`;
  this.dom_number.setAttribute('mode','selectnumber');
  if (this.number === 6 || this.number === 8) {
    this.dom_number.classList.add('number-red');
  }
  if ("desert"===this.resource) {
    this.dom_number.className += " robber";
    this.dom_hex.className += " robber";
  } else {
    this.dom_number.innerText = this.number;
  }
  board.appendChild(this.dom_number);
}

let territories = [
	new Territory(board,1,3,[0,1,2,10,9,8]),
  new Territory(board,1,5,[2,3,4,12,11,10]),
  new Territory(board,1,7,[4,5,6,14,13,12]),
  
  new Territory(board,2,2,[7,8,9,19,18,17]),
  new Territory(board,2,4,[9,10,11,21,20,19]),
  new Territory(board,2,6,[11,12,13,23,22,21]),
  new Territory(board,2,8,[13,14,15,25,24,23]),
  
  new Territory(board,3,1,[16,17,18,29,28,27]),
  new Territory(board,3,3,[18,19,20,31,30,29]),
  new Territory(board,3,5,[20,21,22,33,32,31]),
  new Territory(board,3,7,[22,23,24,35,34,33]),
  new Territory(board,3,9,[24,25,26,37,36,35]),
  
  new Territory(board,4,2,[28,29,30,40,39,38]),
  new Territory(board,4,4,[30,31,32,42,41,40]),
  new Territory(board,4,6,[32,33,34,44,43,42]),
  new Territory(board,4,8,[34,35,36,46,45,44]),
  
  new Territory(board,5,3,[39,40,41,49,48,47]),
  new Territory(board,5,5,[41,42,43,51,50,49]),
  new Territory(board,5,7,[43,44,45,53,52,51])
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

// Create boats
let ports = shuffle([null,null,null,null,"wheat","sheep","ore","wood","brick"]);
Array.from(document.querySelectorAll('.boat')).forEach(b=>{
  let p = ports.shift();
  if (p) {
    b.classList.add(`boat-${p}`);
  }
});

// Update piece counts
update_piece_counts();
function available(el) {
  return +el.querySelector('.count').innerText;
}

// Click Handlers
handler.start = ()=>{
  window.location.hash = "skipwelcome";
};
handler.selectroad = (el)=>{
  if (mode==="placeroad") {
    clearmode();
    el.classList.add("player");
    el.classList.add(active_color);
    update_piece_counts();
    clearmessage();
   }
  if (mode==="remove") {
    clearmode();
    el.classList.remove("player");
    el.classList.remove("red");
    el.classList.remove("white");
    el.classList.remove("blue");
    el.classList.remove("orange");
    update_piece_counts();
    clearmessage();
  }
};
handler.placesettlement = (el)=> {
  if (available(el) === 0) {
    setmessage("No settlements left!");
    return "";
  }
};
handler.placeroad = (el)=> {
  if (available(el) === 0) {
    setmessage("No roads left!");
    return "";
  }
};
handler.placecity = (el)=>{
  if (available(el)===0) {
    setmessage("No cities left!");
    return "";
  }
  setcolor(el.getAttribute('color'));
};
handler.selectnumber = (el)=>{
  if (el.classList.contains('robber')) {
    return "moverobber";
  }
  else if (mode==='moverobber') {
    document.querySelector('.number.robber').classList.remove('robber');
    document.querySelector('.resource.robber').classList.remove('robber');
    territories.filter((t) => t.dom_number === el).forEach(t => {
      t.dom_number.classList.add('robber');
      t.dom_hex.classList.add("robber");
    });
  }
};
handler.selectcorner = (el)=>{
  let index = el.getAttribute('index');
  let settlement = settlements[index];
  if (mode==="remove") {
    clearmode();
    el.classList.remove("settlement");
    el.classList.remove("city");
    el.classList.remove("player");
    el.classList.remove("red");
    el.classList.remove("white");
    el.classList.remove("blue");
    el.classList.remove("orange");
    settlement.player = null;
    settlement.city = false;
    update_piece_counts();
  }
  if (mode==="placesettlement") {
    clearmode();
    el.classList.add("settlement");
    el.classList.add("player");
    el.classList.add(active_color);
    settlement.player = active_color;
    update_piece_counts();
  }
  if (mode==="placecity") {
    clearmode();
    el.classList.remove("settlement");
    el.classList.add("city");
    settlement.city = true;
    update_piece_counts();
  }
};
handler.roll = (el)=>{
  Array.from(document.querySelectorAll('.roll-active')).forEach(a=>{
    a.classList.remove("roll-active");
  });
  let button = document.querySelector('.dice-button');
  button.classList.add('shake-horizontal');
  let roll = 0;
  // Update dice
  Array.from(document.querySelectorAll('.dice')).forEach(d=>{
    d.className="dice";
    let r = Math.ceil(Math.random()*6);
    roll += r;
    d.classList.add("dice-"+r);
  });

  // Remove all other classes
  Array.from(document.querySelectorAll('.card')).forEach(c=>{
    c.className="card";
    c.innerText="";
  });

  setTimeout(()=>{
    button.classList.remove("shake-horizontal");
    if (roll===7) {
      setmessage("Move the robber");
      return setmode("moverobber");
    }
    // Apply roll to territories
    let allocations = {};
    territories.forEach(t=>{
      if (t.number === roll || (roll===7 && t.dom_hex.classList.contains('robber'))) {
        t.dom_hex.classList.add("roll-active");
        t.dom_number.classList.add("roll-active");

        // Allocate resource cards
        t.settlements.forEach(s=>{
          if (!allocations[t.resource]) {
            allocations[t.resource] = {"red":0,"white":0,"blue":0,"orange":0};
          }
          if (s.player && !t.dom_hex.classList.contains('robber')) {
            if (s.city) {
              allocations[t.resource][s.player]+=2;
            }
            else {
              allocations[t.resource][s.player]++;
            }
          }
        });
      }
    });

    // Update cards
    let resource;
    let a,p,card = 0;
    for (resource in allocations) {
      if (resource==="desert") { continue; }
      a=allocations[resource];
      for (p in a) {
        let selector = `.player-panel-${p} .card`;
        let c = document.querySelectorAll(selector)[card];
        c.classList.add(resource);
        if (a[p]>0) {
          c.innerText = a[p];
        }
      }
      card++;
    }

  },300);

};

// Welcome
if ("#skipwelcome"!==window.location.hash) {
  setmode("welcome");
}
