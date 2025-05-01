function app () {
  const startConversationButton = document.getElementById('startConversationButton');
  const systemMessageText = document.getElementById('systemMessageText');
  const messagesDisplay =  document.getElementById('messagesDisplay');
  const sendMessageButton = document.getElementById('sendMessage');
  const userMessageText = document.getElementById('userMessage');

  let isSystemMessageTextDisabled = false;

  // systemMessageText.addEventListener('focusout', function (evt) {
  //   addSystemMessageTextToList();
  // });


  systemMessageText.onkeydown = function(e){
    if (e.key === 'Enter') {
      addSystemMessageTextToList();
    }
  };

  // systemMessageText.addEventListener('keyup', function (evt) {
  //   if (this.value.trim().length > 0) {
  //     // unhide the button?
  //     startConversationButton.style.display = '';
  //     console.log('has text');
  //   } else {
  //     // button should be hid?
  //     startConversationButton.style.display = 'none';
  //   }
  // });

  // Resets everything
  startConversationButton.addEventListener('click', (evt) => {
    evt.preventDefault();
    // Reset the message display
    resetMessageDisplay();
    // Re-enable the text area
    systemMessageText.removeAttribute('disabled')
    isSystemMessageTextDisabled = false;
    // Hide the button
    startConversationButton.style.display = 'none';
  });

  async function sendMessageHandler (evt) {
    evt.preventDefault();

    // If send is pressed and nothing is in the input, it does nothing
    const userMessageTextValue = userMessageText.value;

    if (userMessageTextValue.trim().length < 1) {
      return;
    }

    // Check to see if we've added the system text to the display yet
    // if this is true then we added it already
    if (!isSystemMessageTextDisabled) {
      addSystemMessageTextToList();
    }

    // Add to our display listing
    messagesDisplay.append(createDisplayNode(userMessageTextValue, 'user'));

    // reset the input
    userMessageText.value = '';

    // Disable the button
    sendMessageButton.setAttribute('disabled', 'disabled');

    //unhide the spinner
    statusSpinner.style.display = '';
    // unhide the button spinner

    // Send to the server
    await sendToServer({ system: systemMessageText.value, human: userMessageTextValue });

    // undisable the button
    sendMessageButton.removeAttribute('disabled');

    //hide the spinner
    statusSpinner.style.display = 'none';
  }

  userMessageText.onkeydown = function(e){
    if (e.key === 'Enter') {
      sendMessageHandler(e);
    }
  };

  sendMessageButton.addEventListener('click', (evt) => {
    sendMessageHandler(evt);
  });

  function resetMessageDisplay() {
    messagesDisplay.replaceChildren();
  }

  function addSystemMessageTextToList() {
    const _systemMessageText = systemMessageText.value.trim();
    // moved out of the box, add the value of this input to the message list as a sytem message
    messagesDisplay.append(createDisplayNode(_systemMessageText, 'system'));
    // Also make sure the text area is diabled and show the start conversation button
    systemMessageText.setAttribute('disabled', 'disabled');
    isSystemMessageTextDisabled = true;
    startConversationButton.style.display = '';
  }

  function createDisplayNode(val, type) {/*
<div class="list-group-item list-group-item d-flex justify-content-between align-items-center">
      <div class="card">
        <h5 class="card-header">System Message</h5>
        <div class="card-body">
          <p class="card-text">
            You are a helpful, respectful and honest assistant named "Parasol Assistant".
      You will be given a claim summary, references to provide you with information, and a question. You must answer the question based as much as possible on this claim with the help of the references.
      Always answer as helpfully as possible, while being safe. Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature.
      
      If a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information.
      
      You must answer in 4 sentences or less.
      
      Don't make up policy term limits by yourself.
          </p>
        </div>
      </div>
    </div>
*/

    const listGroupitem = document.createElement("div");
    listGroupitem.className ='list-group-item list-group-item d-flex justify-content-between align-items-center';

    // Create the Card Text
    const cardText = document.createElement("p");
    cardText.className = 'card-text'
    cardText.append(val);

    // Create the Card Body
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    if (type === 'system') {
      cardBody.style = 'background: lightgrey';
    }
    cardBody.append(cardText);

    // Create the Card Header
    const cardHeader = document.createElement('h5');
    cardHeader.className = 'card-header';
    cardHeader.append(`${capitalizeFirstLetter(type)} Message`);

    // Create the card
    const card = document.createElement('div');
    card.className = 'card';
    card.append(cardHeader, cardBody);

    listGroupitem.append(card);

    return listGroupitem;
  }

  async function sendToServer(payload) {
    const result = await fetch('/api/playground', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: {
          system: payload.system,
          human: payload.human
        }
      })
    });

    const jsonResult = await result.json();
    messagesDisplay.append(createDisplayNode(jsonResult.result, 'AI'));
  }
}

function capitalizeFirstLetter(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

app();