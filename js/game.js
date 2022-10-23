/* ================================================================== //
   __GLOBAL__ Global Variables
// ================================================================== */

/*

Register global varibles in GAME_get object.
Access and change global variables using GAME_get object.

onChange events for global variables can be registered in GAME_onChange.
GAME_onChange's purpose is to update global variables in real-time while the game is running.

For example, changeing global variable "map_speed" will call aditional function(s) that will
update the animation's speed for .object-grass, .object-pipe, and body's background-image. 

Use GAME_read to access unchangable & originally initialized global variables.
GAME_read is mainly used for reset purposes only, just stick to GAME_get to get what ever you need.

*/

const GAME_read = Object.freeze({
  // [HTML object] / Target for "Avatar"
  avatar: document.getElementById('avatar').children[0],
  /* (Unit: Pixels). Distance between old and newly summoned pipe.
  used in setMapSpeed() "main.js" function. (Preferably 350 pixels on 100% resolution) */
  pipes_between_distance: 350,
  /* (Unit: Pixels) per time.
  (manipulated in "initializeGameForStart" and "stopMapMovement" function in main.js) */
  map_speed: 300,
  hitbox: false, // (Unit: Boolean)
  time: 1,       // (Unit: Seconds)
  gravity: 9.75, // (Unit: Pixels) per second. [Earth: g=9.81, Prefered: 9.75]
  volume: 100,   // (Unit: % Percentage)
  audios: importSounds([
     'sfx_swooshing.wav',
     'sfx_point.wav',
     'sfx_wing.wav',
     'sfx_die.wav',
     'sfx_hit.wav',
  ],'sounds/')
});



const GAME_get = {
  pipes_summoning: false, // Boolean
  pipes_summoning_interval: undefined, // interval function
  pipes_summoning_intervalDelay: 1500, // milliseconds, used in setMapSpeed() "main.js" function
  pipes_summoning_randomVertical: true, // Boolean
  pipes_collision: true, // Boolean

  // Used in avatar.js (WARNING! Changeing these values may not take affect due to manipulations of avatar's CSS "avatar.js" functions)
  avatar_animationFly: true, // Boolean
  avatar_animationFalling: false, // Boolean
  avatar_animationCostume: false, // Boolean (Setting to TRUE will not take affect if not called with "GAME_onChange" event)
  avatar_animationCostume_interval: undefined, // interval function
  avatar_animationCostume_intervalDelay: 150, // milliseconds (150 preferably at menu, 75 when playing game), initialized in "initializeGameForStart" and "startGame" function

  avatar_moveFall: false, // Boolean
  avatar_moveFall_interval: undefined, // interval function
  avatar_moveFall_intervalDelay: 12, // milliseconds

  is_gameOver: false, // Boolean
  score: 0, // Integer
  score_mode: true, // Boolean
  score_best: localStorage.getItem("score_best") ? Number(localStorage.getItem("score_best")) : 0, // Integer
};



// Apply GAME_read data to GAME_get object
for (key in GAME_read) {
  GAME_get[key] = GAME_read[key];
}



const GAME_onChange = new Proxy(GAME_get,
{
  get: function (target, key)
  {
    // Output Error to console.
    let message = "'GAME_onChange' does not handle returns without key's initialization. Use 'GAME_get' instead!";
    throw new Error(message);
  },
  set: function (target, key, value)
  {
    target[key] = value;

    switch(key) 
    {
      case "pipes_between_distance":
        // Update pipes between distance  
        GAME_onChange.map_speed = GAME_get.map_speed;
        GAME_onChange.pipes_summoning = GAME_get.pipes_summoning;
        break;
        
      case "pipes_summoning":
      case "pipes_summoning_intervalDelay":
        // Toggle pipesSummoning.
        clearInterval(GAME_get.pipes_summoning_interval);
        // Update pipesSummoning delay when pipes_summoning is activated.
        if (GAME_get.pipes_summoning) {
          let delay = eval(GAME_get.pipes_summoning_intervalDelay * GAME_get.time)
          pipesSummoning(delay);
        }
        break;

      case "avatar_animationCostume":
      case "avatar_animationCostume_intervalDelay":
        // Toggle avatarAnimationCostume.
        clearInterval(GAME_get.avatar_animationCostume_interval);
        // Update avatarAnimationCostume delay when avatarCostumeAnimation is activated.
        if (GAME_get.avatar_animationCostume) {
          let delay = eval(GAME_get.avatar_animationCostume_intervalDelay * GAME_get.time)
          avatarAnimationCostume(delay);
        }
        break;

      case "avatar_moveFall":
      case "avatar_moveFall_intervalDelay":
        // Toggle avatarMovementFall.
        clearInterval(GAME_get.avatar_moveFall_interval);
        // Update avatarMovementFall delay when avatar_moveFall is activated.
        if (GAME_get.avatar_moveFall) {
          let delay = eval(GAME_get.avatar_moveFall_intervalDelay * GAME_get.time)
          avatarMovementFall(delay, GAME_get.gravity);
        }
        break;

      case "hitbox":
        // Toggle Avatar's hitbox.
        let color = ((/true/i).test(GAME_get.hitbox)) ? "rgba(255,255,255,0.5)" : "transparent";
        let css = `.object-pipe > .pipe, #avatar > .body { background-color: ${color} }`;
        createStyle('hitbox', css);
        break;

      case "map_speed":
        // Update mapSpeed.
        setMapSpeed(GAME_get.map_speed, GAME_get.time);
        break;

      case "time":
        // Update time for avatarAnimationCostume and mapSpeed.
        GAME_onChange.avatar_animationCostume = GAME_get.avatar_animationCostume;
        GAME_onChange.map_speed = GAME_get.map_speed;
        GAME_onChange.pipes_summoning = GAME_get.pipes_summoning;
        break;

      case "volume":
        for (audio in GAME_get.audios) {
          GAME_get.audios[audio].volume = Number(GAME_get.volume) / 100;
        }
        break;

      default:
        // Output Error to console.
        let message = `'${key}' is initialized to '${value}', however, the key does not have onChange function. Use 'GAME_get' instead!`;
        throw new Error(message);
    }
    return true;
  }
});