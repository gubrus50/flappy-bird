/* ================================================================== //
   __GENERAL__ Computing, Libraries, etc.
// ================================================================== */



// Source Accessed 27.11.2021 //
// Source URL: https://css-tricks.com/get-value-of-css-rotation-through-javascript/
function getElementsAngle(element)
{
  let st = window.getComputedStyle(element, null);
  let tr = st.getPropertyValue("-webkit-transform")
        || st.getPropertyValue("-moz-transform")
        || st.getPropertyValue("-ms-transform")
        || st.getPropertyValue("-o-transform")
        || st.getPropertyValue("transform");

  let values = null;

  if (tr!="none")
  {
    values = tr.split('(')[1],
    values = values.split(')')[0],
    values = values.split(',');
  }
  else { return false; }

  let b = values[1];
  let angle = Math.round(Math.asin(b) * (180/Math.PI));

  return angle;
}



// Appends style tag in head tag.
// Repeated className stylesheets will be re-writen / replaced.
function createStyle(className, css)
{
  // Regexp removes white spaces at first position
  css.replace(/^\s+|\s+$/gm, '');
  stylesheet = document.head.querySelector(`[class="${className}"]`);

  if (stylesheet) {
    stylesheet.innerHTML = css;
  }
  else {
    head = document.head || document.getElementsByTagName('head')[0];
    stylesheet = document.createElement('style');
    stylesheet.type = 'text/css';
    stylesheet.className = className;
    stylesheet.appendChild(document.createTextNode(css));
    head.appendChild(stylesheet);
  }
}



function removeStyle(className) {
  let stylesheet = document.head.querySelector(`style[class="${className}"]`);
  if (stylesheet) {
    stylesheet.remove();
  } else {
    console.error(`Cannot remove unknown stylesheet "${className}".`);
  }
}



// Source Accessed 21.09.2022 //
// Source URL: https://flaviocopes.com/how-to-slow-loop-javascript/
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}



// Import game audio from ./sounds directory
function importSounds(audio_names, _dir="") {

  let audios = {};

  for (index in audio_names)
  {
    let audio_name = audio_names[index];
    let audio = new Audio(_dir + audio_name);
    
    audio.loop = false;
    audio.preload = 'auto';
    
    audios[audio_name.replace('.','_')] = audio;
  }

  return audios;
}