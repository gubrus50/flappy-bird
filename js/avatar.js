/* ================================================================== //
   __OBJECT_AVATAR__ Animations
// ================================================================== */



function avatarAnimationCostume(delay_milliseconds) {
  // Animate avatar, flying animation using background image
  clearInterval(GAME_get.avatar_animationCostume_interval);

  GAME_get.avatar_animationCostume_interval = setInterval(function(){
    avatarNextCostume();
  }, delay_milliseconds);
}



function avatarNextCostume() {
  // Change avatars costume to next instance when global variable animationFly is true
  let avatar = GAME_get.avatar;

  if (GAME_get.avatar_animationFly) {
    let a_pos = avatar.style.backgroundPositionX;
    let position = ""

    if (!GAME_get.avatar_animationFalling)
    {
      switch (a_pos)
      {
        case 'left':
          position = 'center';
          break;

        case 'center':
          position = 'right';
          break;

        case 'right':
          position = 'left';
          break;

        default:
          position = 'left';
      }
    }
    else {
      position = 'center';
    }

    if (position) {
      avatar.style.backgroundPosition = position;
    }
  }
}



function avatarAnimationFlap() {
  // Rotate avatar from current angle back to -25 degrees
  let avatar = GAME_get.avatar;
  GAME_get.avatar_animationFalling = false;

  /* Get current rotation angle of Avatar */
  angle = getElementsAngle(avatar);
  if (!angle) { angle = 0 }

  let css = `
  #avatar > .body {
    transform: rotate(${angle}deg);
    animation: fly-flap ${eval(0.1 * GAME_get.time)}s linear;
  }`;

  avatar.removeEventListener('animationend', avatarAnimationFalling);
  avatar.addEventListener('animationend', avatarAnimationFall);
  createStyle('avatar-animation-jump', css);
}



function avatarAnimationFall() {
  // Rotate avatar from -25 angle to 90 degree fall, towards the ground
  let avatar = GAME_get.avatar;
  let css = `
  #avatar > .body {
    transform: rotate(-25deg);
    animation: fall ${eval(0.4 * GAME_get.time)}s linear;
    animation-delay: ${eval(0.4 * GAME_get.time)}s;
  }`;

  avatar.addEventListener('animationend', avatarAnimationFalling);
  createStyle('avatar-animation-jump', css);
}



function avatarAnimationFalling() {
  // Make avatar face the ground
  GAME_get.avatar_animationFalling = true;
  let css = `#avatar > .body { transform: translateY(5px) rotate(90deg);}`;
  createStyle('avatar-animation-jump', css);
}



function avatarAnimationFly() {
  // Start Avatar's flying animation
  GAME_onChange.avatar_moveFall = false;
  GAME_get.avatar_animationFalling = false;
  GAME_get.avatar_animationFly = true;
  GAME_onChange.avatar_animationCostume = true;
  GAME_onChange.avatar_animationCostume_intervalDelay = 150;
  
  GAME_get.avatar.parentElement.classList.add('flying');
  removeStyle('avatar-animation-jump');
}



function avatarMovementFall(delay_milliseconds, gravity)
{
  clearInterval(GAME_get.avatar_moveFall_interval);
  GAME_get.avatar_moveFall_interval = setInterval(function()
  {
    let avatar = GAME_get.avatar;
    let avatar_height = avatar.offsetHeight;
    let avatar_topPosition = avatar.getBoundingClientRect().top;
    let pipes_height = document.getElementById('object-pipes').offsetHeight;
    let pipes_topPosition = document.getElementById("object-pipes").getBoundingClientRect().top;
    let pipes_bottomPosition = document.getElementById("object-pipes").getBoundingClientRect().bottom;
    
    let css = undefined;
    let css_topPosition = avatar_topPosition + gravity * 0.50; // Default, keep avatar falling
    let avatarToGrass_percentage = (avatar_topPosition + avatar.offsetHeight) / pipes_height * 100;

    if (!GAME_get.is_gameOver)
    {
      // Restrain avatar from flying above display
      if (avatarToGrass_percentage <= -20) {
        let avatar_topPosition = avatar.getBoundingClientRect().top;
        css_topPosition = pipes_topPosition - avatar_height - 20;
      }
      // Move avatar downwards
      else if (avatarToGrass_percentage <= 100) {  
        css_topPosition = avatar_topPosition + gravity * 0.50;
      }
      // Call gameOver when avatar is below ground/footer level
      else if (avatarToGrass_percentage >= 100) {
        GAME_get.audios.sfx_hit_wav.play();
        gameOver();
      }
    }
    // Restrain avatar from falling out of the ground/footer, when on gameOver
    else if (avatarToGrass_percentage >= 100) {
      css_topPosition = pipes_bottomPosition - avatar_height;
    }

    css = `
    #avatar {
      top: ${css_topPosition}px;
      transform: translateY(10px);
    }`;

    createStyle('avatar-move-fall',css);

  }, delay_milliseconds);
}



async function avatarMovementFlap() {

  let avatar = GAME_get.avatar;
  let avatar_topPosition = avatar.getBoundingClientRect().top;
  let avatar_newTopPosition = avatar_topPosition;
  
  let audio_flap = GAME_get.audios.sfx_wing_wav.cloneNode(true);
      audio_flap.volume = Number(GAME_get.volume) / 100;
      audio_flap.play();
      
  avatarAnimationFlap();

  // Original source: https://www.youtube.com/watch?v=3SsYZDJdeXk&ab_channel=KnifeCircus, video_time:9.36
  let jumpCount = 0;
  var jumpInterval = setInterval(function()
  {
    GAME_onChange.avatar_moveFall = false;

    if (jumpCount > 20) {
      GAME_onChange.avatar_moveFall = true;
      clearInterval(jumpInterval)
      jumpCount = 0;
    }
    jumpCount++;
  }, 10  * GAME_get.time);

  // Avatar flaps/flies upwards by 3 pixels, 20 repetitions
  for (let i=0; i<20; i++) {

    avatar_newTopPosition -= 3;
    let css = `
    #avatar {
      top: ${avatar_newTopPosition}px;
      transform: translateY(10px);
    }`;

    createStyle('avatar-move-fall', css);
    await sleep((0.4 * GAME_get.time) / 2)
  }

  await sleep((250 * GAME_get.time))
}