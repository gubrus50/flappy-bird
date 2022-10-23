function makeScrollWheelFunctional() {

  let scroll_wheels = document.querySelectorAll(".scroll-wheel");

  scroll_wheels.forEach((scroll_wheel) => {
    let texture = document.createElement("span");
    scroll_wheel.appendChild(texture);

    let target_input = document.querySelector(`input[name='${scroll_wheel.getAttribute("for")}']`);
    let isMouseDown;
    let mousePos = 0;

    // Scroll_wheel's scroll and drag functionality
    scroll_wheel.addEventListener("mousedown", () => {
      window.onmousemove = (e) => moveScrollWheel(e);
      scroll_wheel.style.setProperty('opacity', 1);
      isMouseDown = true;
    });
    scroll_wheel.addEventListener("wheel", (e) => {
      moveScrollWheel(e);
      isMouseDown = false;
    });
    window.addEventListener("mouseup", () => {
      scroll_wheel.style.removeProperty('opacity');
      window.onmousemove = false;
      isMouseDown = false;
    });
    // Connected scroll_wheel's functionality with target_input
    if (target_input)
    {
      // Initialize scroll_wheel's attributes with target_input's attributes
      if (target_input.hasAttribute("max")) {
        scroll_wheel.setAttribute("data-max", target_input.getAttribute("max"));
      }
      if (target_input.hasAttribute("min")) {
        scroll_wheel.setAttribute("data-min", target_input.getAttribute("min"));
      }
      if (target_input.hasAttribute("value")) {
        scroll_wheel.setAttribute("value", target_input.getAttribute("value"));
      }

      // Update scroll_wheel's value to target_input's value
      if (!validRange(target_input.value)) {
        target_input.value = "";
        target_input.setAttribute("value", "");
        scroll_wheel.setAttribute("value", "");
      }
      target_input.addEventListener("change", (e) => {
        
        let value = Number(e.target.value);

        if (validRange(value)) {
          target_input.value = value;
          target_input.setAttribute("value", value);
          scroll_wheel.setAttribute("value", value);
        }
        else {
          target_input.value = "";
          target_input.setAttribute("value", "");
          scroll_wheel.setAttribute("value", "");
        }
      });
    }

    function moveScrollWheel(event)
    {
      let newMousePos = event.clientX;
      // Get and validate "value" for number data type
      let value = scroll_wheel.getAttribute('value');
          value = (value && isNaN(value)) ? 0 : Number(value);

      if (!validRange(value)) {
        if (scroll_wheel.hasAttribute("data-min")) {
          value = Number(scroll_wheel.getAttribute("data-min"));
        }
        else if (scroll_wheel.hasAttribute("data-max")) {
          value = Number(scroll_wheel.getAttribute("data-max"));
        }
      }
      // Send value to adequate event
      if (event.type == "wheel") {
        updateScrollWheel(event, false, value);
      }
      else if (isMouseDown) {
        updateScrollWheel(event, newMousePos, value);
      }
    }

    function validRange(value)
    {
      // Return false if new value is greater data-max
      if (scroll_wheel.hasAttribute("data-max")) {
        let data_max = Number(scroll_wheel.getAttribute("data-max"));
        if (value > data_max) { return false; }
      }
      // Return false if new value is lower data-min
      if (scroll_wheel.hasAttribute("data-min")) {
        let data_min = Number(scroll_wheel.getAttribute("data-min"));
        if (value < data_min) { return false; }
      }
      return true;
    }

    function updateScrollWheel(event, newMousePos, value)
    {
      let scroll_texture = scroll_wheel.firstChild;

      
      function setPositionAndValue(value) {
        if (!scroll_wheel.hasAttribute("disabled"))
        {
          scroll_wheel.setAttribute('value', value);
          scroll_texture.style.setProperty('background-position-x', value+'px');
          
          // Update target_input's value to scroll_wheel's value
          if (target_input) {
            target_input.value = value;
            target_input.setAttribute("value", value);
          }
        }
      }

      if (event.type == "wheel") {
        if (event.wheelDelta > 0 && validRange(value + 1)) {
          setPositionAndValue(value + 1) // Move texture right
        }
        else if (event.wheelDelta < 0 && validRange(value - 1)) {
          setPositionAndValue(value - 1) // Move texture left
        }
      }
      else {
        if (newMousePos > mousePos && validRange(value + 1)) {
          setPositionAndValue(value + 1) // Move texture right
        }
        else if (newMousePos < mousePos && validRange(value - 1)) {
          setPositionAndValue(value - 1) // Move texture left
        }
        mousePos = event.clientX;
      }
    }
  });
}