function makeToggleButtonFunctional() {

  let toggle_buttons = document.querySelectorAll(".toggle-button");
  toggle_buttons.forEach((toggle_button) => {

    // Create and append span toggle_on + toggle_off to toggle_button
    let span_on  = document.createElement("span");
    let span_off = document.createElement("span");

    span_on.classList.add("toggle-on");
    span_on.innerHTML = "On";

    span_off.classList.add("toggle-off");
    span_off.innerHTML = "Off";

    toggle_button.appendChild(span_on);
    toggle_button.appendChild(span_off); 

    initializeForCurrentState();

    // Initialize state of the toggle_button
    function initializeForCurrentState()
    {
      if (toggle_button.getAttribute("value") == "true") {
        span_on.classList.remove("disabled");
        span_off.classList.add("disabled");
      }
      else {
        span_off.classList.remove("disabled");
        span_on.classList.add("disabled");
      }
    }

    // Self initialize to "value" attribute's state
    // https://javascript.info/mutation-observer
    const observer = new MutationObserver(initializeForCurrentState);
    observer.observe(toggle_button, { attributeFilter: ["value"] });

    // Add onClick functionality
    span_on.addEventListener("click", () => {
      if (!toggle_button.hasAttribute("disabled"))
      {
        toggle_button.setAttribute("value", "true");
      }
    });
    span_off.addEventListener("click", () => {
      if (!toggle_button.hasAttribute("disabled"))
      {
        toggle_button.setAttribute("value", "false");
      }
    });
  });
}