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
  const userInput = document.getElementById('user-input').value;
  if (!userInput || !currentConversationId) return;

  const message = {
    sender: 'Vous',
    text: userInput,
    idConv: currentConversationId // Inclure l'ID de la conversation courante
  };

  try {
    const response = await fetch(`http://localhost:5000/api/conversations/${currentConversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    const newMessage = await response.json();
    const conversation = conversations.find(c => c.id === currentConversationId);
    if (conversation) {
      conversation.messages.push(newMessage);
      renderMessages();
    }

    document.getElementById('user-input').value = '';

    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.style.display = 'block';

    const aiResponse = await fetch('http://localhost:5000/api/conversations/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputText: userInput })
    });

    const result = await aiResponse.json();
    if (conversation) {
      conversation.messages.push({ sender: 'IA', text: result });
      renderMessages();
    }

    // Display reasoning
    const reasoning = document.getElementById('reasoning');
    reasoning.textContent = `Raisonnement: ${result.reasoning}`;
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Hide loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.style.display = 'none';
  }
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
