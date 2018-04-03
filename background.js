let _voice;
let _volume;
let _rate;
let _pitch;
let _lang;
let timeoutResumeInfinity;
let readtxt = '';
let reading = false;

let funcToInject = function() {
    let selection = window.getSelection();
    return (selection.rangeCount > 0) ? selection.toString() : '';
};
let jsCodeStr = ';(' + funcToInject + ')();';

function ReadWhenAvailable() {
	reading = true;
	let voices = window.speechSynthesis.getVoices();

	if (voices.length !== 0) {
		var msg = new SpeechSynthesisUtterance();
		msg.voice = window.speechSynthesis.getVoices().find(function (el) {
				return el.name == _voice
			}); // Note: some voices don't support altering params
		msg.voiceURI = 'native';
		msg.volume = _volume; // 0 to 1
		msg.rate = _rate; // 0.1 to 10
		msg.pitch = _pitch; //0 to 2
		msg.text = readtxt;
		msg.lang = (_lang == 'default') ? voices[1].lang : _lang;

		msg.onend = function (e) {
			reading = false;
			chrome.contextMenus.remove("TtoMCancel");
		};

		//stop anything that is currently speaking
		speechSynthesis.cancel();

		setTimeout(function () {
			let contextItemCancel = {
				"id": "TtoMCancel",
				"title": "Stop Reading",
				"contexts": ["all"]
			};
			chrome.contextMenus.create(contextItemCancel);
			if (msg.text == 'undefined') {
				msg.text = 'Try again, sorry.';
			}

			speechSynthesis.speak(msg);
		}, 250);
	} 
	else {
		setTimeout(function () {
			ReadWhenAvailable();
		}, 10)
	}
}

function ReadText(thetext) {

	chrome.storage.sync.get({
		voice: 'Google US English',
		volume: 1,
		rate: 1,
		pitch: 1,
		lang: 'default'
	}, function (items) {
		_voice = items.voice;
		_volume = items.volume;
		_rate = items.rate;
		_pitch = items.pitch;
		_lang = items.lang;

		readtxt = thetext;
		ReadWhenAvailable();
	});
};

let contextItem = {
	"id": "TtoM",
	"title": "Read Text",
	"contexts": ["selection"]
};

chrome.contextMenus.create(contextItem);

chrome.contextMenus.onClicked.addListener(function (data) {
	if (data.menuItemId == "TtoM") {
		ReadText(data.selectionText);
	} else if (data.menuItemId == "TtoMCancel") {
		speechSynthesis.cancel();
	}
});

chrome.commands.onCommand.addListener(function (cmd, txt) {
	if (cmd == 'exec_T2M' && reading == false)
	{
		/* Inject the code into all frames of the active tab */
        chrome.tabs.executeScript({
            code: jsCodeStr,
            allFrames: true   //  <-- inject into all frames, as the selection 
                              //      might be in an iframe, not the main page
        }, function(selectedTextPerFrame) {
            if (chrome.runtime.lastError) {
                ReadText('There was an issue getting the selected text');
            } else if ((selectedTextPerFrame.length > 0)
                    && (typeof(selectedTextPerFrame[0]) === 'string')) {                
                ReadText(selectedTextPerFrame[0]);
            }
        });
	}
	else{
		reading = false;
		speechSynthesis.cancel();
	}
	
});