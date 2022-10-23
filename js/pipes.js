/* ================================================================== //
   __OBJECT_PIPE__ Animations and more
// ================================================================== */



function pipesSummoning(delay_milliseconds) {
  clearInterval(GAME_get.pipes_summoning_interval);
  GAME_get.pipes_summoning_interval = setInterval(function(){
    createPipe();
  }, delay_milliseconds);
}



function createPipe() {

  obj_pipes = document.getElementById("object-pipes");

  // Pipe
  obj_pipe = document.createElement("div");
  obj_pipe.setAttribute("class", "object-pipe");

  // Pipe TOP
  obj_child_pipeTop = document.createElement("div");
  obj_child_pipeTop.setAttribute("class", "pipe pipe-top");
  obj_child_pipeTop.innerHTML += "<span></span>";

  // Pipe Bottom
  obj_child_pipeBottom = document.createElement("div");
  obj_child_pipeBottom.setAttribute("class", "pipe pipe-bottom");
  obj_child_pipeBottom.innerHTML += "<span></span>";
  
  // Pipe Break Point
  obj_child_pipeBreak = document.createElement("div");
  obj_child_pipeBreak.setAttribute("class", "pipe-break");

  obj_pipe.appendChild(obj_child_pipeTop);
  obj_pipe.appendChild(obj_child_pipeBreak);
  obj_pipe.appendChild(obj_child_pipeBottom);
  obj_pipes.appendChild(obj_pipe);

  // Randomize pipe's vertical-axis
  if (GAME_get.pipes_summoning_randomVertical)
  {
    pipe_break_height = getComputedStyle(document.documentElement)
    .getPropertyValue('--pipe-break-height')
    .trim().match(/[\d]*/)[0];

    pipe_base_height = getComputedStyle(document.documentElement)
    .getPropertyValue('--pipe-base-height')
    .trim().match(/[\d]*/)[0];

    pipeTop_minHeight_percentage = 100 - ((obj_pipes.offsetHeight - pipe_base_height ) / obj_pipes.offsetHeight * 100);
    pipeTop_maxHeight_percentage = (obj_pipes.offsetHeight - pipe_break_height - pipe_base_height) / obj_pipes.offsetHeight * 100;
    pipeTop_randomHeight_percentage = Math.floor((Math.random() * (pipeTop_maxHeight_percentage - pipeTop_minHeight_percentage)) + pipeTop_minHeight_percentage);

    obj_pipe.getElementsByClassName("pipe-top")[0].style.height = pipeTop_randomHeight_percentage + "%";
  }
  obj_pipe.getElementsByClassName("pipe-bottom")[0].style.height = "100%";


  // Add score when pipe passes by the avatar
  obj_pipe.addEventListener('animationstart', (e) => { addScore(e.target); avatarAndPipeCollision(e.target); });
  // Destroy pipe after animation
  obj_pipe.addEventListener('animationend', (e) => e.target.remove() );
}