let conversations = [];
let currentConversationId = null;

async function fetchConversations() {
  try {
    const response = await fetch('http://localhost:5000/api/conversations');
    conversations = await response.json();
    renderConversations();
    toggleChatContainer();
  } catch (error) {
    console.error('Error fetching conversations:', error);
  }
}

async function createConversation() {
  const conversation = {
    name: `Conversation ${conversations.length + 1}`
  };

  try {
    const response = await fetch('http://localhost:5000/api/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(conversation)
    });

    const newConversation = await response.json();
    conversations.push(newConversation);
    currentConversationId = newConversation.id;
    await fetchConversations(); // Fetch updated list of conversations
    renderConversations();
    renderMessages();
    toggleChatContainer(); // Show chat container when a conversation is created
  } catch (error) {
    console.error('Error creating conversation:', error);
  }
}

async function renameConversation(conversationId, newName) {
  try {
    await fetch(`http://localhost:5000/api/conversations/${conversationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: newName })
    });

    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.name = newName;
      renderConversations();
    }
  } catch (error) {
    console.error('Error renaming conversation:', error);
  }
}

async function deleteConversation(conversationId) {
  try {
    await fetch(`http://localhost:5000/api/conversations/${conversationId}`, {
      method: 'DELETE'
    });

    conversations = conversations.filter(c => c.id !== conversationId);
    if (currentConversationId === conversationId) {
      currentConversationId = conversations.length ? conversations[0].id : null;
    }
    renderConversations();
    renderMessages();
    toggleChatContainer(); // Hide chat container if no conversations left
  } catch (error) {
    console.error('Error deleting conversation:', error);
  }
}

async function renderMessages() {
  const chatBox = document.getElementById('chat-box');
  chatBox.innerHTML = '';
  if (!currentConversationId) return;

  try {
    const response = await fetch(`http://localhost:5000/api/conversations/${currentConversationId}/messages`);
    const messages = await response.json();

    messages.forEach(message => {
      const messageDiv = document.createElement('div');
      messageDiv.textContent = `${message.sender}: ${message.message}`;
      chatBox.appendChild(messageDiv);
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
}

async function sendMessage() {
  const userInput = document.getElementById('user-input');
  const message = userInput.value.trim();

  if (!message || !currentConversationId) return;

  try {
    const response = await fetch(`http://localhost:5000/api/conversations/${currentConversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sender: 'user', text: message }),
    });

    if (!response.ok) {
      console.error('Erreur lors de l\'envoi du message');
      return;
    }

    const newMessage = await response.json();

    // Ajouter le message à l'interface utilisateur
    addMessageToChat(newMessage.sender, newMessage.message);

    // Réinitialiser le champ d'entrée
    userInput.value = '';
  } catch (error) {
    console.error('Erreur réseau :', error);
  }
}

function addMessageToChat(sender, message) {
  const chatBox = document.getElementById('chat-box');
  const messageElement = document.createElement('div');
  messageElement.className = `message ${sender}`;
  messageElement.textContent = message;
  chatBox.appendChild(messageElement);

  // Faire défiler vers le bas pour voir le dernier message
  chatBox.scrollTop = chatBox.scrollHeight;
}

function loadConversation(conversationId) {
  fetch(`/api/conversations/${conversationId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const chatBox = document.getElementById('chat-box');
        chatBox.innerHTML = ''; // Réinitialiser le chat

        data.messages.forEach((message) => {
          addMessageToChat(message.sender, message.content);
        });
      } else {
        console.error('Erreur lors du chargement de la conversation :', data.error);
      }
    })
    .catch((error) => {
      console.error('Erreur réseau :', error);
    });
}

function toggleReasoning() {
  const reasoning = document.getElementById('reasoning');
  if (reasoning.style.display === 'none') {
    reasoning.style.display = 'block';
  } else {
    reasoning.style.display = 'none';
  }
}

function toggleNoConversationMessage() {
  const noConversation = document.getElementById('no-conversation');
  if (conversations.length === 0) {
    noConversation.style.display = 'block';
  } else {
    noConversation.style.display = 'none';
  }
}

function toggleChatContainer() {
  const chatContainer = document.getElementById('chat-container');
  if (conversations.length === 0) {
    chatContainer.style.display = 'none';
  } else {
    chatContainer.style.display = 'flex';
  }
}

function renderConversations() {
  const conversationList = document.getElementById('conversation-list');
  conversationList.innerHTML = '';

  conversations.forEach(conversation => {
    const conversationItem = document.createElement('li');
    conversationItem.className = 'conversation-item';
    conversationItem.textContent = conversation.titre;
    conversationItem.onclick = () => {
      currentConversationId = conversation.id;
      renderMessages();
      highlightSelectedConversation(conversationItem);
    };
    conversationList.appendChild(conversationItem);
  });
}

function highlightSelectedConversation(selectedItem) {
  const items = document.querySelectorAll('.conversation-item');
  items.forEach(item => {
    item.classList.remove('selected');
  });
  selectedItem.classList.add('selected');
}

// Initial call to fetch conversations and set chat container visibility
fetchConversations();
toggleNoConversationMessage();
toggleChatContainer();
