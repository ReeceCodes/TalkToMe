// Saves options to chrome.storage
function save_options() {
  let _voice = document.getElementById('voice').value;
  let _volume = document.getElementById('volume').value;
  let _rate = document.getElementById('rate').value;
  let _pitch = document.getElementById('pitch').value;
  let _lang = document.getElementById('lang').value;
 
  chrome.storage.sync.set({
    voice: _voice,
    volume: _volume / 100,
    rate: _rate,
    pitch: _pitch,
    lang: _lang
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {
  
  chrome.storage.sync.get({
    voice: 'Google US English',
    volume: 1,
	rate: 1,
	pitch: 1,
	lang: 'default'
  }, function(items) {
    document.getElementById('voice').value = items.voice;
    document.getElementById('volume').value = items.volume*100;
	document.getElementById('rate').value = items.rate;
	document.getElementById('pitch').value = items.pitch;
	document.getElementById('lang').value = items.lang;
  });
  
}

function FillVoices()
{
loadVoicesWhenAvailable();
}

loadVoicesWhenAvailable();

function loadVoicesWhenAvailable() {
         let voices = window.speechSynthesis.getVoices();
let sel = document.getElementById("voice");

         if (voices.length !== 0) {
                console.log("start loading voices");
                for (let i = 0; i < voices.length; i++)
{
let opt = voices[i];
let newEl = document.createElement("option");
newEl.textContent = opt.name + " lang: " + opt.lang;
newEl.value = opt.name;
sel.appendChild(newEl);

restore_options();
}
            }
            else {
                setTimeout(function () { loadVoicesWhenAvailable(); }, 10)
            }
    }



document.addEventListener('DOMContentLoaded', FillVoices);
document.getElementById('save').addEventListener('click',
    save_options);