function makeSlidersFunctional() {

  let sliders = document.querySelectorAll(".slider > .slider-handle");
  sliders.forEach((slider_handle) => {

    // Initialize current slider_handler's and slider's progress position
    let slider          = slider_handle.parentNode;
    let slider_bar      = slider.getElementsByClassName('slider-bar')[0];
    let slider_progress = slider_bar.getElementsByClassName('slider-progress')[0];
    
    initializeForCurrentState();

    // Slider's drag functionality
    let isMouseDown;

    slider_handle.addEventListener("mousedown", () => {
      window.onmousemove = (e) => moveSliderHandle(e);
      isMouseDown = true;
    });
    slider_bar.addEventListener("mousedown", () => {
      window.onmousemove = (e) => moveSliderHandle(e);
      isMouseDown = true;
    });
    slider_bar.addEventListener("click", () => {
      window.onclick = (e) => moveSliderHandle(e);
      isMouseDown = true;
    });
    window.addEventListener("mouseup", () => {
      window.onmousemove = false;
      isMouseDown = false;
    });

    // Self initialize to "value" attribute's state
    // https://javascript.info/mutation-observer
    var observer = new MutationObserver(() => {
      observer.disconnect();
      initializeForCurrentState();
    });
    observer.observe(slider, { attributeFilter: ["value"] });

    // Initialize state of the slider
    function initializeForCurrentState()
    {
      let value = slider.getAttribute("value");
      // Get valid percentage (must be a number, in range of 0 - 100)
      let percentage = (value && isNaN(value)) ? 0 : Number(value);
      if (percentage > 100
      ||  percentage < 0)
      {
        console.error(`Slider's attribute 'value' is out of range (0-100): "${percentage}".`);
        slider.setAttribute("disabled", true);
        percentage = 0;
      }
      adjustSliderHandlePosition(percentage, getHalfHandleWidth());
    }

    function getHalfHandleWidth() {
      // Get half-width of slider_handle in percentage
      return Math.round(((slider_handle.offsetWidth / slider_bar.offsetWidth) * 100) / 2);
    }

    function moveSliderHandle(event)
    {
      if (isMouseDown && !slider.hasAttribute("disabled")) {
        // Get slider_bar's width and half-width of slider_handle in percentage
        let slider_position = event.clientX - slider.getBoundingClientRect().left;
        let percentage = Math.round((slider_position / slider_bar.offsetWidth) * 100);
        
        adjustSliderHandlePosition(percentage, getHalfHandleWidth());
      }
    }

    function adjustSliderHandlePosition(percentage, half_handle)
    {
      // Set slider_handle's position and prevent it from overflowing slider_bar's start and end position
      if (percentage >= half_handle && percentage <= (100 - half_handle)) {
        slider_handle.style.setProperty('--slider-percentage', percentage+'%');
      }
      else if (percentage >= (100 - half_handle)) {
        slider_handle.style.setProperty('--slider-percentage', (100 - half_handle)+'%');
      }
      else if (percentage <= half_handle) {
        slider_handle.style.setProperty('--slider-percentage', half_handle+'%');
      }

      if (percentage >= 0 && percentage <= 100) {
        // Set percentage for attribute "value" and for the slider's/user's display
        slider_handle.innerHTML = percentage+'%';
        slider.setAttribute('value', percentage);
        
        /* Enable observer.
           Observer cannot be active when changeing attribute "value"
           as it will create infinite loop, glitching the website in the mean time.
        */
        if (observer) { observer.observe(slider, { attributeFilter: ["value"] }); }

        // Update slider's progress position and background-color
        if (slider.hasAttribute("show-progress")) {
          slider_progress.style.setProperty('--slider-percentage', percentage+'%');
          slider_progress.classList.remove("high");
          slider_progress.classList.remove("low");
          
          (percentage >= 45 && percentage <= 60)
          ? slider_progress.classList.add("middle")
          : slider_progress.classList.remove("middle");

          if (percentage >= 0 && percentage <= 30) {
            slider_progress.classList.add("low");
          }
          else if (percentage >= 75 && percentage <= 100) {
            slider_progress.classList.add("high");
          }
        }
      }
    }
  });
}