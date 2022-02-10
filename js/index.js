let disks;
let num_of_disks = 4;

const btn_start = document.querySelector('#btn_start');
const btn_pause = document.querySelector('#btn_pause');
const btn_reset = document.querySelector('#btn_reset');
let time_limit = null;
let counter = 0;
let pause = false;

btn_start.addEventListener('click', handle_start);
btn_pause.addEventListener('click', handle_pause);
btn_reset.addEventListener('click', handle_reset);
let alertPlaceholder = document.getElementById('message')

window.onload = function() 
{
    set_board();
    window.addEventListener("beforeunload", function (e) {
        e.preventDefault();
        if (!pause) //game in progress
        {
          let message = "";
          (e || window.event).returnValue = message;
          return message;
        }
    });
};


function set_board() 
{
  disks = new Array();

  for (let i = 0; i < num_of_disks; i++) 
  {
    disks.push(new Disk("disk" + (i + 1)));
  }
}


function handle_start() 
{
  if(is_last_disk() || time_limit === counter )
  {
    return;
  }

  if (pause === true) 
  {  
    if (init_time_limit())
    {
      pause = false;
    } 
  }
  else if (init_time_limit()) {
    window.setInterval(function () {
      if (pause === false) {
        handle_time_check();
        update_disks_positions();
        check_disks_touched();
      }
    }, 10);
  }
}

function handle_pause() {
  pause = true;
}

function handle_reset() {
  pause = true;
  reset_board();
  counter = 0;
  time_limit = null;
}

function reset_board() {
  disks.forEach(disk => {
    disk.pos = init_disk_position(disk);
    disk.Disable(false);
  });
}

function Disk(name) {  
  this.name = name;
  this.obj = document.getElementById(name);
  this.size = this.obj.clientWidth;
  this.radius = this.size / 2;
  this.containerSize = { x: this.obj.offsetParent.offsetWidth, y: this.obj.offsetParent.offsetHeight }
  this.posBoundries = { x: this.containerSize.x - this.size / 2, y: this.containerSize.y - this.size / 2 }
  this.pos = init_disk_position(this);
  this.speed = { x: 1000 * (Math.random() - 0.5), y: 1000 * (Math.random() - 0.5) };
  this.disable = false;
  this.Disable = function (status){

    if(status === true)
    {
      this.obj.style.visibility = "hidden";
      this.disable = true;
    }
    else
    {
      this.obj.style.visibility = "visible";
      this.disable = false;
    }
  };


  this.update_position = function () 
  {
    let diskHitWall = true;

    // update position for each disk
    this.pos.x = update_pos(this.pos.x, this.radius, this.posBoundries.x, this.speed.x * 0.01);
    if (diskHitWall)
      this.speed.x = (-this.speed.x);

    this.pos.y = update_pos(this.pos.y, this.radius, this.posBoundries.y, this.speed.y * 0.01);
    if (diskHitWall)
      this.speed.y = (-this.speed.y);

    //update the new positions for each disk (on screen)
    this.obj.style.left = (this.pos.x - (this.size / 2)) + "px";
    this.obj.style.top = (this.pos.y - (this.size / 2)) + "px";

    function update_pos(pos, minPos, maxPos, movement) 
    {
      let range = maxPos - minPos;
      let newPos = pos + movement;

      // check wall hit:
      // hit minPos side
      if (pos - minPos < -movement && -movement < range) 
      {
        diskHitWall = true;
        return (2 * minPos - newPos);
      }
      // hit maxPos side
      if (maxPos - pos < movement && movement < range) 
      {
        diskHitWall = true;
        return (2 * maxPos - newPos);
      }
      diskHitWall = false; //no hit.

      return ((newPos + 2 * range) % (2 * range));
    }
  }
}

function update_disks_positions() 
{
  for (let i = 0; i < disks.length; i++) 
  {
    disks[i].update_position();
  }
}

function check_disks_touched() {

  for (let i = 0; i < disks.length; i++) 
  {
    for (let j = i + 1; j < disks.length; j++) {

      if (two_disks_touched(disks[i], disks[j])) {
        if(generate_random_bool())
        {
          disks[j].Disable(true);
        }
        else disks[i].Disable(true);

        if(is_last_disk()) 
        {
          handle_pause();
          handle_endgame();
        }
      }
    }
  }
}

function two_disks_touched(disk1, disk2) 
{
  let xDistance = disk2.pos.x - disk1.pos.x;
  let yDistance = disk2.pos.y - disk1.pos.y;
  return !disk1.disable && !disk2.disable && (Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2)) < disk1.radius + disk2.radius);
}

function generate_random_bool() 
{
  return Math.round(Math.random())
}

function is_last_disk()
{
  let cnt = 0;
  disks.forEach(d => {
    if (d.disable) cnt++ ;
  });

  return cnt === num_of_disks - 1;
}

//returns true if time limit is valid, otherwise returns false
function init_time_limit() 
{
  let time = document.querySelector('#time_limit').value;

  if (time) {
    for (let i = 0; i < time.length; i++) {
      const digit = time[i];
      if (digit < '0' || digit > '9') {
        message('Please enter only numbers.', "warning");
        time_limit = null;
        return false;
      }
    }
    time = Number(time);
  }

  time_limit = time;
  return true;
}

function handle_time_check() 
{
  if (counter === time_limit) 
  {
    handle_pause();
    handle_endgame();
  }
  else 
  {
    counter++;
  }
}

function handle_endgame()
{
  message('Game Over. Try to beat the time: ' + counter, 'success');
}


function init_disk_position(disk) 
{
  pos = { x: 0, y: 0 };

  if (disk.obj.id === "disk1") {
    pos.y = 0;
    pos.x = random_width(disk.radius);
  }
  else if (disk.obj.id === "disk2") {
    pos.y = random_height(disk.radius);
    pos.x = 0;
  }
  else if (disk.obj.id === "disk3") {
    pos.y = document.getElementById("container").clientHeight - 2 * disk.radius;
    pos.x = random_width(disk.radius);
  }
  else if (disk.obj.id === "disk4") {
    pos.y = random_height(disk.radius);
    pos.x = document.getElementById("container").clientWidth - 2 * disk.radius;
  }

  disk.obj.style.left = pos.x + 'px'
  disk.obj.style.top = pos.y + 'px';

  return pos;
}

// randomize a value from 0 to max rectangle width
function random_width(radius) {
  return Math.random() * ((document.getElementById("container").clientWidth - 2 * radius));
}


// randomize a value from 0 to max rectangle height
function random_height(radius) {
  return Math.random() * ((document.getElementById("container").clientHeight - 2 * radius));
}


function message(message, type) {
  let wrapper = document.createElement('current-message')
  wrapper.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible" role="alert">' + message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'

  alertPlaceholder.append(wrapper)
}