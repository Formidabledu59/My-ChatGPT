let conversations = [];
let currentConversationId = null;

function createConversation() {
  const conversationId = Date.now().toString();
  const conversation = {
    id: conversationId,
    name: `Conversation ${conversations.length + 1}`,
    messages: []
  };
  conversations.push(conversation);
  currentConversationId = conversationId;
  renderConversations();
  renderMessages();
  toggleChatContainer(); // Show chat container when a conversation is created
}

function renameConversation(conversationId, newName) {
  const conversation = conversations.find(c => c.id === conversationId);
  if (conversation) {
    conversation.name = newName;
    renderConversations();
  }
}

function deleteConversation(conversationId) {
  conversations = conversations.filter(c => c.id !== conversationId);
  if (currentConversationId === conversationId) {
    currentConversationId = conversations.length ? conversations[0].id : null;
  }
  renderConversations();
  renderMessages();
  toggleChatContainer(); // Hide chat container if no conversations left
}

function renderConversations() {
  const conversationList = document.getElementById('conversation-list');
  conversationList.innerHTML = '';
  conversations.forEach(conversation => {
    const li = document.createElement('li');
    const input = document.createElement('input');
    input.value = conversation.name;
    input.onchange = (e) => renameConversation(conversation.id, e.target.value);
    li.appendChild(input);
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.onclick = () => deleteConversation(conversation.id);
    li.appendChild(deleteButton);
    li.onclick = () => {
      currentConversationId = conversation.id;
      renderMessages();
    };
    conversationList.appendChild(li);
  });
  toggleNoConversationMessage();
}

function renderMessages() {
  const chatBox = document.getElementById('chat-box');
  chatBox.innerHTML = '';
  if (!currentConversationId) return;
  const conversation = conversations.find(c => c.id === currentConversationId);
  if (conversation) {
    conversation.messages.forEach(message => {
      const messageDiv = document.createElement('div');
      messageDiv.textContent = `${message.sender}: ${message.text}`;
      chatBox.appendChild(messageDiv);
    });
  }
}

async function sendMessage() {
  const userInput = document.getElementById('user-input').value;
  if (!userInput || !currentConversationId) return;

  const conversation = conversations.find(c => c.id === currentConversationId);
  if (conversation) {
    conversation.messages.push({ sender: 'Vous', text: userInput });
    renderMessages();
  }

  document.getElementById('user-input').value = '';

  // Show loading indicator
  const loadingIndicator = document.getElementById('loading-indicator');
  loadingIndicator.style.display = 'block';

  try {
    const response = await fetch('http://localhost:5000/api/conversations/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputText: userInput })
    });

    const result = await response.json();
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

// Initial call to display the no conversation message if there are no conversations
toggleNoConversationMessage();
toggleChatContainer(); // Initial call to set chat container visibility
