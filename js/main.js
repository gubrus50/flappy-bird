function addScore(pipe) {
  // Increment score when avatar passes by the pipe
  let score = document.getElementById("score");
  let interval = setInterval(function()
  {
    let pipe_rightPosition = pipe.getBoundingClientRect().right;
    let avatar_rightPosition = GAME_get.avatar.getBoundingClientRect().right;

    if (GAME_get.is_gameOver
    || !GAME_get.score_mode)
    {
      clearInterval(interval);
    }
    else if (pipe_rightPosition <= avatar_rightPosition)
    {
      GAME_get.score += 1;

      let audio_score = GAME_get.audios.sfx_point_wav.cloneNode(true);
          audio_score.volume = Number(GAME_get.volume) / 100;
          audio_score.play();

      score.innerHTML = GAME_get.score;
      clearInterval(interval);
    }
  }, 100);
}



function setMapSpeed(speed, time=1) {

  let doc_style = getComputedStyle(document.documentElement);
  let footer_width = document.getElementsByTagName("footer")[0].offsetWidth;
  let pipe_width = Number(doc_style.getPropertyValue('--pipe-width').slice(0, -2));

  // Animation/finish_time = Distance (pixels) / Speed (pixels) * Time (seconds)
  const finishTime = {
    pipe: (footer_width / speed) * time,
    city: (footer_width / speed) * time * 2, // move twice as slow
    grass:  (pipe_width / speed) * time, // synchronise with pipe's speed
  };

  GAME_get.pipes_summoning_intervalDelay = ((GAME_get.pipes_between_distance + pipe_width) / speed) * 1000; // milliseconds

  let css = `
  body {
    animation: move-city ${finishTime.city}s linear infinite;
  }
  .object-pipe {
    animation: move-pipe ${finishTime.pipe}s linear;
  }
  .object-grass > span {
    animation: move-grass ${finishTime.grass}s linear infinite;
  }
  `;

  createStyle('map-speed', css);
}



function stopMapMovement()
{
  let avatar_parent = GAME_get.avatar.parentElement;
  let pipes = document.getElementsByClassName('object-pipe');
  let grass = document.querySelector('.object-grass > span');
  let body = document.body;

  // Stop pipes motion and prevent stop their summoning
  for (let i=0; i<pipes.length; i++) {
    let p=pipes[i];
    p.style.marginLeft = p.getBoundingClientRect().left + "px";
    p.style.animation = "";
  }
  GAME_onChange.pipes_summoning = false;

  avatar_parent.style.left = getComputedStyle(avatar_parent).left;
  grass.style.backgroundPosition = getComputedStyle(grass).backgroundPosition;
  body.style.backgroundPositionX = getComputedStyle(body).backgroundPositionX;

  // Disable animation speed. (onChange event will enable animation motion if value is greater than 0)
  GAME_onChange.map_speed = 0;
}



function resetMapMovement() {

  GAME_onChange.map_speed = GAME_read.map_speed;

  let avatar_parent = GAME_get.avatar.parentElement;
  let pipes = document.getElementsByClassName('object-pipe');
  let grass = document.querySelector('.object-grass > span');
  let doc_style = getComputedStyle(document.documentElement);

  avatar_parent.style.left = doc_style.getPropertyValue('--avatar-left-position');
  document.body.style.backgroundPositionX = "";
  grass.style.backgroundPosition = "";
}



async function gameOver() {
  // Set game over
  GAME_get.is_gameOver = true;
  stopMapMovement();

  // Disable flapping/jumping
  document.body.removeEventListener("keyup", eventListener_amf);
  document.body.removeEventListener("click", eventListener_amf);
  
  // Avatars Collision flash effect
  document.body.classList.add('flash');
  await sleep(500);
  document.body.classList.remove('flash');
  await sleep(1000);

  // Set best score and save it in localStorage
  if (GAME_get.score > GAME_get.score_best) {
    GAME_get.score_best = GAME_get.score;
    localStorage.setItem("score_best", GAME_get.score_best)
  }

  // Hide score
  let score = document.getElementById("score");
      score.classList.add("hide-fade");
      score.addEventListener("animationend", () => {
         score.classList.add("hide");
         score.classList.remove("hide-fade");
      }, { once: true });

  // Show menu with the scoreboard data and GameOver banner
  let menu = document.getElementById("menu");
  let board = menu.getElementsByClassName('board')[0];
  let medal = board.getElementsByClassName("medal")[0];

  board.getElementsByClassName("score")[0].innerHTML = GAME_get.score;
  board.getElementsByClassName("score")[1].innerHTML = GAME_get.score_best;

  if (GAME_get.score_best >= 100) {
    medal.setAttribute("class", "medal diamond");
  }
  else if (GAME_get.score_best >= 50) {
    medal.setAttribute("class", "medal gold");
  }
  else if (GAME_get.score_best >= 10) {
    medal.setAttribute("class", "medal bronze");
  }
  else {
    medal.setAttribute("class", "medal");
  }

  displayMenu('scoreboard');
}



async function initializeGameForStart() {
  /* RESET GLOBAL VARIABLES
  
  Do note that some of the global variables are re-initialized
  at some of the functions found within this script:

    --avatarAnimationFly()
    --resetMapMovement()
  */
  GAME_get.is_gameOver = true;
  GAME_onChange.pipes_summoning = false;
  GAME_onChange.avatar_moveFall = false;
  GAME_get.pipes_collision = false;
  GAME_get.score_mode = false;

  // Remove pipes
  document.querySelectorAll('#object-pipes > .object-pipe').forEach((pipe) => pipe.remove());

  // Reset and display score
  GAME_get.score = 0;
  let score = document.getElementById("score");
      score.innerHTML = "";
      score.classList.remove("hide");
  
  // Show start menu
  displayMenu();

  removeStyle('avatar-move-fall');
  avatarAnimationFly();
  resetMapMovement();

  GAME_get.is_gameOver = false;
  applySettings();
}



async function startGame() {
  if (!GAME_get.pipes_summoning)
  {
    // Remove pipes
    document.querySelectorAll('#object-pipes > .object-pipe').forEach((pipe) => pipe.remove());

    // Turn birds gravity and flying animation
    GAME_onChange.avatar_animationCostume_intervalDelay = 75;
    GAME_onChange.avatar_moveFall = true;
    GAME_get.avatar.parentElement.classList.remove('flying');

    // Enable flapping/jumping
    document.body.addEventListener("keyup", eventListener_amf);
    document.body.addEventListener("click", eventListener_amf);

    // Hide menu
    displayMenu(false);

    // Start summoning pipes after delay, also,
    // enable collision and score functionality
    await sleep(GAME_get.time * 2500);
    if (!GAME_get.is_gameOver)
    {
      GAME_get.score_mode = true;
      GAME_get.pipes_collision = true;
      GAME_onChange.pipes_summoning = true;
    } 
  }
}



function avatarAndPipeCollision(pipe) {
  let interval = setInterval(async () =>
  {
    let pipe_break = pipe.childNodes[1];

    // E.g. lPost where l = left & Pos = position
    let pb_lPos = pipe_break.getBoundingClientRect().left;
    let pb_rPos = pipe_break.getBoundingClientRect().right;
    let pb_tPos = pipe_break.getBoundingClientRect().top;
    let pb_bPos = pipe_break.getBoundingClientRect().bottom;

    let a_lPos = GAME_get.avatar.getBoundingClientRect().left;
    let a_rPos = GAME_get.avatar.getBoundingClientRect().right;
    let a_tPos = GAME_get.avatar.getBoundingClientRect().top;
    let a_bPos = GAME_get.avatar.getBoundingClientRect().bottom;

    if (!GAME_get.is_gameOver && GAME_get.pipes_collision) {
      // If avatar IS between the break horizontally
      if (pb_lPos <= a_rPos && pb_rPos >= a_lPos)
      { // If avatar is NOT between the break vertically
        if (!(pb_tPos <= a_tPos && pb_bPos >= a_bPos))
        {
          gameOver();

          GAME_get.audios.sfx_hit_wav.play();
          await sleep(1000);
          GAME_get.audios.sfx_die_wav.play();

          clearInterval(interval);
        }
      }
    }
    else {
      clearInterval(interval);
    }
  }, 100);
}



/* ================================================================== //
   __MAIN__ On Ready App
// ================================================================== */

// Flap avatar (jump) with spacebar and mouse
const eventListener_amf = (event) => {
  if (event.keyCode == 32
  &&  event.type == "keyup"
  ||  event.type == "click"
  ) { avatarMovementFlap(); }
}

window.onload = () => {

  if (window.addEventListener) {
    adjustMenu();

    // Adjust map's speed to current resolution
    setMapSpeed(GAME_get.map_speed, GAME_get.time);
    window.addEventListener('resize', function() {
      setMapSpeed(GAME_get.map_speed, GAME_get.time);
    }, true);
  }

  initializeGameForStart();
  makeOptionsFunctional();
}