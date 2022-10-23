/* ================================================================== //
   __MENU__ Functionality and Position Adjustment
// ================================================================== */



function adjustMenu() {
  //Adjust menu to centre position and then display it
  let menu = document.getElementById("menu");

  menu_height = menu.getBoundingClientRect().height;
  menu_width  = menu.getBoundingClientRect().width;

  menu.style.top = `calc(50vh - ${menu_height}px / 2)`;
  menu.style.left = `calc(50vw - ${menu_width}px / 2)`;
  menu.style.opacity = 1; 
}



async function displayMenu(container_name) {

  let menu   = document.getElementById("menu");
  let banner = menu.getElementsByClassName("banner")[0];
  let board  = menu.getElementsByClassName("board")[0];
  let option = menu.getElementsByClassName("options")[0];



  const showMenu = function(boolean=true) {
    // Hide board and menu if false
    if (!boolean) {
      menu.classList.add("hide");
      board.classList.add("hide");
      menu.classList.remove("show-slide");
    
      showBoard(false);
      showBanner(false);
      showOptions(false);
    }
    // Show menu if true
    else {
      menu.classList.remove("hide");
      menu.classList.remove("hide-fade");
    }
  }



  const showBanner = function(selector) {
    // Show specific image from .banner using selector. If selector is empty: hide all .banner's images
    (!selector)
    ? Array.from(banner.querySelectorAll("img")).map(img => img.classList.add("hide"))
    : banner.querySelector(selector).classList.remove("hide");
  }



  const showBoard = function(selector) {
    // Show specific .container using selector. If selector is empty: hide all .board's .container(s)
    if (!selector) {
      Array.from(board.querySelectorAll(".container")).map(con => con.classList.add("hide"))
      board.classList.add("hide");
    }
    else {
      board.querySelector(selector).classList.remove("hide");
      board.classList.remove("hide");
    }
  }



  const showOptions = function(selector) {
    // Show specific .btn(s) using selector. If selector is empty: hide all .option's .btn(s)
    if (!selector) {
      Array.from(option.querySelectorAll(".btn")).map(btn => {
        btn.classList.add("hide");
        btn.setAttribute("disabled", true);
      });
    }
    else {
      let selectors = selector.split(',');
      selectors.forEach((selector) => {
        option.querySelector(selector).classList.remove("hide");
        option.querySelector(selector).removeAttribute("disabled");
      });
    }
  }



  switch(container_name)
  {
    case "scoreboard":
      // Show menu, with banner: "Game-over"; and enabled button: "RESTART" & "MORE"
      GAME_get.audios.sfx_swooshing_wav.play();
      showMenu(false);
      showMenu();
      showBanner("img.game-over");
      showBoard(".container[name='scoreboard']");
      showOptions(".btn[name='replay'], .btn[name='more']");
      menu.classList.add("show-slide");
      break;



    case "settings":
      // Show settings, with banner: $CurrentBanner; and enable button: $CurrentButton & "BACK"
      previous_banner = banner.querySelector("img:not(.hide)");
      previous_button = option.querySelector(".btn:not(.hide)");
      previous_board  = board.querySelector(".container:not(.hide)");

      showMenu(false);
      showMenu();
      showBoard(".container[name='settings']");
      previous_banner.classList.remove("hide");
      previous_button.classList.remove("hide");
      previous_button.removeAttribute("disabled");
      showOptions(".btn[name='back']");

      // "BACK" button's functionality, return to previous menu
      option.querySelector(".btn[name='back']").addEventListener("click", () => {
        // Replace current board to previous board if possible
        showBoard(false);
        if (previous_board) {
          showBoard(`.container[name='${previous_board.attributes.name.value}']`);
        }
        // Show previous buttons
        showOptions(false);
        previous_button.classList.remove("hide");
        previous_button.removeAttribute("disabled");
        showOptions(".btn[name='more']");
        // Adjust menu's central position
        adjustMenu();

        // Remove and stop summoning pipes when user is on start/main menu
        if (!GAME_get.is_gameOver) {
          GAME_onChange.pipes_summoning = false;
          document.querySelectorAll('#object-pipes > .object-pipe').forEach((pipe) => pipe.remove());
        }
      }, { once: true });
      break;



    case false:
      // Hide menu with delay animation
      menu.classList.add("hide-fade");
      await sleep(500);
      showMenu(false);
      break



    default:
      // Show start menu
      showMenu(false);
      showMenu();
      showBanner("img.logo");
      showOptions(".btn[name='start'], .btn[name='more']");
  }
  // Adjust menu's central position
  adjustMenu();
}



function resetSettings() {

  // Initialize sliders' value and functionality 
  if (document.querySelector(".slider"))
  {
    let settings = document.querySelector("#menu .container[name='settings']");
    let sliders  = settings.querySelectorAll(".slider");
    
    sliders.forEach((slider) => {
      let name = slider.getAttribute("name");

      switch(name) {
        case "volume":
          slider.setAttribute("value", GAME_read.volume);
          break;
        case "time":
        case "map-speed":
        case "gravity":
          slider.setAttribute("value", 50);
          break;

        default:
          console.error(`Cannot initialize element '.slider' with attribute 'name'="${name}".`);
      }
    });
  }

  // Initialize input's "pipes-between-distance" value
  let name = "pipes-between-distance";
  let input = document.querySelector(`input[name='${name}']`);
  if (input)
  {
    let doc_style = getComputedStyle(document.documentElement);
    let pipe_width = Number(doc_style.getPropertyValue('--pipe-width').slice(0, -2));

    input.setAttribute("max", 1000);
    input.setAttribute("min", (pipe_width / 2) * -1);
    input.setAttribute("value", GAME_read.pipes_between_distance);
    input.value = GAME_read.pipes_between_distance;
  }

  // Initialize hitbox toggle-button
  document.querySelector(".toggle-button[name='hitbox']").setAttribute("value", GAME_read.hitbox);

  applySettings();
}



function lockSettings() {

  let settings = document.querySelectorAll("#menu .container[name='settings'] .lockable");
  
  if (settings) {
    settings.forEach((setting) => {
      setting.setAttribute("disabled", true);
    });
  }
}



function unlockSettings() {

  let settings = document.querySelectorAll("#menu .container[name='settings'] .lockable");
  
  if (settings) {
    settings.forEach((setting) => {
      setting.removeAttribute("disabled");
    });
  }
}



function applySettings() {

  if (!GAME_get.is_gameOver)
  {
    let sliders = document.querySelectorAll("#menu .container[name='settings'] .slider");
    if (sliders) {
      sliders.forEach((slider) => {

        let multiplier = slider.hasAttribute("value") ? (Number(slider.getAttribute("value")) / 100) * 2 : 1;
        let name = slider.getAttribute("name");

        switch (name)
        {
          case "volume":
            if (slider.hasAttribute("value")) {
              GAME_onChange.volume = Number(slider.getAttribute("value"));
            }
            break;

          case "time":
            GAME_onChange.time = GAME_read.time * multiplier;
            break;

          case "map-speed":
            GAME_onChange.map_speed = GAME_read.map_speed * multiplier;
            break;

          case "gravity":
            GAME_get.gravity = GAME_read.gravity * multiplier;
            break;
        }
      });
    }

    let input_distance = document.querySelector("input[name='pipes-between-distance']");
    if (input_distance && input_distance.hasAttribute("value"))
    {
      let value = input_distance.getAttribute("value");
          value = (value && isNaN(value)) ? 0 : Number(value);

      GAME_onChange.pipes_between_distance = value;
    }

    let scroll_wheel_distance = document.querySelector(".scroll-wheel[for='pipes-between-distance']");
    if (scroll_wheel_distance && scroll_wheel_distance.hasAttribute("value"))
    {
      let value = input_distance.getAttribute("value");
          value = (value && isNaN(value)) ? 0 : Number(value);

      GAME_onChange.pipes_between_distance = value;
    }

    let btn_toggle_hitbox = document.querySelector(".toggle-button[name='hitbox']");
    if (btn_toggle_hitbox && btn_toggle_hitbox.hasAttribute("value"))
    {
      GAME_onChange.hitbox = btn_toggle_hitbox.getAttribute("value");
    }
  }
}



function makeOptionsFunctional() {

  let buttons = document.querySelectorAll("#menu .options > .btn");
  buttons.forEach((button) => {

    let name = button.getAttribute("name");
    switch (name)
    {
      case "start":
        button.addEventListener("click", () => {
          // Disable setting updates when starting the game
          // (Removing event is essential, becuase it will disturb gameplay when user tries to jump/flap with their mouse)
          window.removeEventListener("click", applySettings);
          // pipes_summoning validation at startGame() will prevent the game from starting
          // Keep it "false" at start's onClick event, otherwise, user will not be able to start the game from setting's board. 
          GAME_onChange.pipes_summoning = false;
          startGame();
          avatarMovementFlap();
        });
      break;

      case "replay":
        button.addEventListener("click", () => {
          initializeGameForStart();
        });
      break;

      case "more":
        button.addEventListener("click", () => {
          displayMenu('settings');

          // If setting's board is accessed while not playing the game,
          // then enable inputs and apply data changes on 'mouseup' event.
          // Other wise, disable all inputs.

          if (!GAME_get.is_gameOver)
          {
            unlockSettings();
            window.removeEventListener("click", applySettings);
            window.addEventListener("click", applySettings);
            GAME_onChange.pipes_summoning = true;
          }
          else {
            lockSettings();
          }
        });
        // Initialize setting's inputs's value and functionality on first click
        button.addEventListener("click", () => {
          
          resetSettings();
          
          if (document.scripts.slider) { makeSlidersFunctional() }
          if (document.scripts.scrollWheel) { makeScrollWheelFunctional() }
          if (document.scripts.toggleButton) { makeToggleButtonFunctional() }

        }, { once: true });
      break;
    }
  });
}