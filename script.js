
//DropDown
const dropdowns = document.querySelectorAll(".dropdown-container"),
  inputLanguageDropdown = document.querySelector("#input-language"),
  outputLanguageDropdown = document.querySelector("#output-language");

function populateDropdown(dropdown, options) {
  dropdown.querySelector("ul").innerHTML = "";
  options.forEach((option) => {
    const li = document.createElement("li");
    const title = option.name + " (" + option.native + ")";
    li.innerHTML = title;
    li.dataset.value = option.code;
    li.classList.add("option");
    dropdown.querySelector("ul").appendChild(li);
  });
}

populateDropdown(inputLanguageDropdown, languages);
populateDropdown(outputLanguageDropdown, languages);

dropdowns.forEach((dropdown) => {
  dropdown.addEventListener("click", (e) => {
    dropdown.classList.toggle("active");
  });

  dropdown.querySelectorAll(".option").forEach((item) => {
    item.addEventListener("click", (e) => {
      dropdown.querySelectorAll(".option").forEach((item) => {
        item.classList.remove("active");
      });
      item.classList.add("active");
      const selected = dropdown.querySelector(".selected");
      selected.innerHTML = item.innerHTML;
      selected.dataset.value = item.dataset.value;
      translate();
    });
  });
});
document.addEventListener("click", (e) => {
  dropdowns.forEach((dropdown) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("active");
    }
  });
});




//swap button

const swapBtn = document.querySelector(".swap-position"),
  inputLanguage = inputLanguageDropdown.querySelector(".selected"),
  outputLanguage = outputLanguageDropdown.querySelector(".selected"),
  inputTextElem = document.querySelector("#input-text"),
  outputTextElem = document.querySelector("#output-text");

swapBtn.addEventListener("click", (e) => {
  const temp = inputLanguage.innerHTML;
  inputLanguage.innerHTML = outputLanguage.innerHTML;
  outputLanguage.innerHTML = temp;

  const tempValue = inputLanguage.dataset.value;
  inputLanguage.dataset.value = outputLanguage.dataset.value;
  outputLanguage.dataset.value = tempValue;


  const tempInputText = inputTextElem.value;
  inputTextElem.value = outputTextElem.value;
  outputTextElem.value = tempInputText;

  translate();
});





//Translate Api 

function translate() {
  const inputText = inputTextElem.value;
  const inputLanguage =
    inputLanguageDropdown.querySelector(".selected").dataset.value;
  const outputLanguage =
    outputLanguageDropdown.querySelector(".selected").dataset.value;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${inputLanguage}&tl=${outputLanguage}&dt=t&q=${encodeURI(
    inputText
  )}`;
  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      outputTextElem.value = json[0].map((item) => item[0]).join("");
    })
    .catch((error) => {
      console.log(error);
    });
}
inputTextElem.addEventListener("input", (e) => {
  if (inputTextElem.value.length > 10000) {
    inputTextElem.value = inputTextElem.value.slice(0, 10000);
  }
  translate();
});






// Speech recognition

function startSpeechRecognitionAndGenerateImage() {
  const recognition = new webkitSpeechRecognition() || SpeechRecognition();
  
  const startSpeechButton = document.getElementById('start-speech-btn');
  startSpeechButton.classList.add('pulse-animation');

  recognition.onend = () => {
    console.log('Speech recognition ended.');
    startSpeechButton.classList.remove('pulse-animation');
  };
 const supportedLanguages = ['en-US'];

  const randomLanguage = supportedLanguages[Math.floor(Math.random() * supportedLanguages.length)];
  recognition.lang = randomLanguage;

  recognition.onstart = () => {
    console.log('Speech recognition started...');
  };

  recognition.onresult = async (event) => {
    const result = event.results[0][0].transcript;
    document.getElementById('input-text').value = result;
  
    const wordCount = result.split(/\s+/).filter(Boolean).length;
    if (wordCount <= 3) {
      try {
        const response = await fetch(`${apiUrl}?query=${result}&client_id=${apiKey}`);
        const data = await response.json();
  
        if (data.results && data.results.length > 0) {
          const imageUrl = data.results[0].urls.small;
          imageOutput.innerHTML = `<img src="${imageUrl}" alt="Generated Image">`;
  
          // Extract a word from the recognized text
          const randomWord = getRandomWord(result);
  
          // Fetch and display the dictionary definition of the selected word
          try {
            const dictionaryResponse = await fetch(`${apiURL}${randomWord}`);
            const dictionaryData = await dictionaryResponse.json();
  
            if (Array.isArray(dictionaryData) && dictionaryData.length > 0) {
              const wordDefinition = dictionaryData[0].meanings[0].definitions[0].definition;
              const partOfSpeech = dictionaryData[0].meanings[0].partOfSpeech;
  
              meanText_Elem.innerHTML = `
                <div class="word">
                  <h3>${randomWord}</h3>
                </div>
                <div class="details">
                  <p>${partOfSpeech}</p>
                </div>
                <p class="word-meaning">
                  ${wordDefinition}
                </p>`;
  
              // Display the dictionary result
              dictionaryResultElem.classList.add("active");
            } else {
              // Clear meanText_Elem and dictionary result if word not found
              meanText_Elem.textContent = "";
              dictionaryResultElem.classList.remove("active");
            }
          } catch (error) {
            console.error("Error fetching word definition:", error);
          }
        } else {
          imageOutput.innerHTML = " ";
        }
        translate();
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    } else {
      imageOutput.innerHTML = " ";
    }
  

    translate();
  };

  recognition.onend = () => {
    console.log('Speech recognition ended.');
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
  };

  recognition.start();
  setTimeout(() => {
    recognition.stop();
    console.log('Speech recognition stopped after 7 seconds.');
  }, 10000); 


  recognition.onend = () => {
    console.log('Speech recognition ended.');
    startSpeechButton.classList.remove('pulse-animation'); 
  };

}




const startSpeechButton = document.getElementById('start-speech-btn');
startSpeechButton.addEventListener('click', startSpeechRecognitionAndGenerateImage);







//Image Using Unspash Api
const input_TextElem = document.getElementById("input-text");
const mean_TextElem = document.getElementById("mean-text");
const imageOutput = document.getElementById("imageOutput");
const apiKey = "8SR_WtDnUK04kPrpnZx_-FrSsvS1HZGGvpdQrBdV51c";
const apiUrl = "https://api.unsplash.com/search/photos";

input_TextElem.addEventListener("input", async () => {
  const inputText = input_TextElem.value;
  const wordCount = inputText.split(/\s+/).filter(Boolean).length;
  if (wordCount <= 3) {
  try {
   
    const response = await fetch(`${apiUrl}?query=${inputText}&client_id=${apiKey}`);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const imageUrl = data.results[0].urls.small;

      
      imageOutput.innerHTML = `<img src="${imageUrl}" alt="Generated Image">`;
    } else {
      imageOutput.innerHTML = " ";
    }
    translate();
  } catch (error) {
    console.error("Error fetching image:", error);
  }
} else {
  imageOutput.innerHTML = " ";
}
});


function generateImageUrl(text) {

  const apiKey = "8SR_WtDnUK04kPrpnZx_-FrSsvS1HZGGvpdQrBdV51c";
  const apiUrl = "https://api.unsplash.com/search/photos";
  const query = encodeURIComponent(text);

  return `${apiUrl}?query=${query}&client_id=${apiKey}`;
}



//text to speech btn

var txtInput = document.querySelector('#input-text');
var txtOutput = document.querySelector('#output-text');
var btnSpeakInput = document.querySelector('#text-to-speech-btn'); 
var btnSpeakOutput = document.querySelector('#Output-text-to-speech-btn'); 
var synth = window.speechSynthesis;
var voices = [];
var speaking = false; 

PopulateVoices();
if (speechSynthesis !== undefined) {
  speechSynthesis.onvoiceschanged = PopulateVoices;
}

btnSpeakInput.addEventListener('click', () => {
  if (speaking) {
    synth.cancel(); 
    speaking = false;
    return;
  }

  var inputToSpeak = new SpeechSynthesisUtterance(txtInput.value);
  
  var defaultVoice = voices.find(voice => voice.name === 'Google US English');
  if (defaultVoice) {
    inputToSpeak.voice = defaultVoice;
  }

  synth.speak(inputToSpeak);
  speaking = true;
});

btnSpeakOutput.addEventListener('click', () => {
  if (speaking) {
    synth.cancel();
    speaking = false;
    return;
  }

  var outputToSpeak = new SpeechSynthesisUtterance(txtOutput.value);
  
  var defaultVoice = voices.find(voice => voice.name === 'Google UK English Male');
  if (defaultVoice) {
    outputToSpeak.voice = defaultVoice;
  }

  synth.speak(outputToSpeak);
  speaking = true;
});

function PopulateVoices() {
  voices = synth.getVoices();
}








//Dictioanry Of the Word
const inputText_Elem = document.getElementById("input-text");
      const meanText_Elem = document.getElementById("mean-text");
      const dictionaryResultElem = document.getElementById("Dictionary");
      const apiURL = "https://api.dictionaryapi.dev/api/v2/entries/en/";

      function getRandomWord(text) {
        const words = text.split(/\s+/).filter(Boolean);
        const randomIndex = Math.floor(Math.random() * words.length);
        return words[randomIndex];
      }

      inputText_Elem.addEventListener("input", async () => {
        const inputText = inputText_Elem.value.trim();

        if (inputText.length > 0) {
          const randomWord = getRandomWord(inputText);

          try {
            const response = await fetch(`${apiURL}${randomWord}`);
            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
              const wordDefinition = data[0].meanings[0].definitions[0].definition;
              const partOfSpeech = data[0].meanings[0].partOfSpeech;

              meanText_Elem.innerHTML = `
                <div class="word">
                  <h3>${randomWord}</h3>
                </div>
                <div class="details">
                  <p>${partOfSpeech}</p>
                </div>
                <p class="word-meaning">
                  ${wordDefinition}
                </p>`;
              
              // Display the dictionary result
              dictionaryResultElem.classList.add("active");
            } else {
              // Clear meanText_Elem and dictionary result if word not found
              meanText_Elem.textContent = "";
              dictionaryResultElem.classList.remove("active");
            }
          } catch (error) {
            console.error("Error fetching word definition:", error);
          }
        } else {
          // Clear meanText_Elem and dictionary result if input text is empty
          meanText_Elem.textContent = "";
          dictionaryResultElem.classList.remove("active");
        }
      });





// Refresh Button
function refreshInputText() {
  const inputTextElem = document.getElementById('input-text');
  const outputTextElem = document.getElementById('output-text');
  const dictionaryResultElem = document.getElementById('mean-text'); 
  const imageOutput = document.getElementById('imageOutput'); 
  
  inputTextElem.value = '';
  outputTextElem.value = ''; 
  dictionaryResultElem.textContent = ''; 
  imageOutput.innerHTML = ''; 
  
  translate();
}

const refreshButton = document.getElementById('refresh-btn');
refreshButton.addEventListener('click', refreshInputText);





//  "Upload File" button
const uploadButton = document.getElementById('upload-btn');
uploadButton.addEventListener('click', () => {
  const uploadDocument = document.getElementById('upload-document');
  uploadDocument.click(); 

  uploadDocument.addEventListener('change', handleUpload);
});

async function handleUpload(event) {
  const file = event.target.files[0];
  const inputTextElem = document.getElementById('input-text');

  if (file.type === 'application/pdf' || file.type === 'text/plain') {
    try {
      let fileContent;

      if (file.type === 'application/pdf') {
        fileContent = await readFileAsArrayBuffer(file);
        const text = await extractTextFromPdf(fileContent);
        inputTextElem.value = text;
      } else if (file.type === 'text/plain') {
        fileContent = await readFileAsText(file);
        inputTextElem.value = fileContent;
      }

      translate();
    } catch (error) {
      console.error('Error handling file:', error);
    }
  } else {
    alert('Please select a .txt or .pdf file.');
  }
}

// Function to read file as ArrayBuffer
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      resolve(e.target.result);
    };
    reader.onerror = function (error) {
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
}

// Function to read file as text
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      resolve(e.target.result);
    };
    reader.onerror = function (error) {
      reject(error);
    };
    reader.readAsText(file);
  });
}

// Function to extract text from PDF using PDF.js
async function extractTextFromPdf(fileContent) {
  try {
    const pdf = await pdfjsLib.getDocument({ data: fileContent }).promise;
    const textContent = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const text = await page.getTextContent();
      text.items.forEach(item => {
        textContent.push(item.str);
      });
    }
    return textContent.join(' ');
  } catch (error) {
    throw error;
  }
}






//paste btn
document.addEventListener('DOMContentLoaded', () => {
  const pasteButton = document.getElementById('paste-btn');
  const inputText = document.getElementById('input-text');

  pasteButton.addEventListener('click', async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      inputText.value = clipboardText;
      
      translate();
    } catch (error) {
      console.error('Error pasting text from clipboard:', error);
    }
  });
});





//copy btn
document.addEventListener('DOMContentLoaded', () => {
  const copyButton = document.getElementById('copy-button');
  const outputText = document.getElementById('output-text');

  copyButton.addEventListener('click', async () => {
    outputText.select();
    try {
      await navigator.clipboard.writeText(outputText.value);
      alert('Text copied to clipboard!');
    } catch (error) {
      console.error('Error copying text to clipboard:', error);
    }
  });
});







// "Download" button
const downloadButton = document.getElementById('download-btn');
downloadButton.addEventListener('click', downloadTranslatedText);

function downloadTranslatedText() {
  const outputText = document.getElementById('output-text').value;
  const outputLanguage = document
    .getElementById('output-language')
    .querySelector('.selected')
    .dataset.value;

  if (outputText) {
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `translated-to-${outputLanguage}.txt`;
    a.href = url;
    a.click();
  }
}

