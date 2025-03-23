let conversations = [];
let currentConversationId = null;
let modalCallback = null;

async function fetchConversations() {
  try {
    const response = await fetch('http://localhost:5000/api/conversations');
    conversations = await response.json();
    renderConversations();
    toggleWelcomeScreen(); // Mettre à jour l'affichage
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
    toggleWelcomeScreen(); // Mettre à jour l'affichage
  } catch (error) {
    console.error('Error creating conversation:', error);
  }
}

function openModal(title, message, showInput = false, callback) {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalMessage = document.getElementById('modal-message');
  const modalInput = document.getElementById('modal-input');

  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalInput.style.display = showInput ? 'block' : 'none';
  modalInput.value = ''; // Reset input value
  modal.style.display = 'flex';

  modalCallback = callback;
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
}

function confirmModal() {
  const modalInput = document.getElementById('modal-input');
  if (modalCallback) {
    modalCallback(modalInput.value);
  }
  closeModal();
}

async function renameConversation(conversationId) {
  const conversation = conversations.find((c) => c.id === conversationId);
  if (!conversation) {
    console.error('Conversation introuvable');
    return;
  }

  openModal(
    'Renommer la conversation',
    'Modifiez le nom de la conversation :',
    true,
    async (newName) => {
      if (!newName || newName === conversation.titre) return; // Ne rien faire si le nom est vide ou inchangé

      try {
        const response = await fetch(`http://localhost:5000/api/conversations/${conversationId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newName }),
        });

        if (!response.ok) {
          console.error('Erreur lors du renommage de la conversation');
          return;
        }

        conversation.titre = newName; // Met à jour le titre localement
        renderConversations();
      } catch (error) {
        console.error('Erreur réseau lors du renommage de la conversation :', error);
      }
    }
  );

  // Pré-remplir le champ de saisie avec le nom actuel
  const modalInput = document.getElementById('modal-input');
  modalInput.value = conversation.titre;
}

async function deleteConversation(conversationId) {
  openModal(
    'Supprimer la conversation',
    'Êtes-vous sûr de vouloir supprimer cette conversation ?',
    false,
    async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/conversations/${conversationId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          console.error('Erreur lors de la suppression de la conversation');
          return;
        }

        conversations = conversations.filter((c) => c.id !== conversationId);
        if (currentConversationId === conversationId) {
          currentConversationId = conversations.length ? conversations[0].id : null;
        }
        renderConversations();
        renderMessages();
        toggleWelcomeScreen(); // Mettre à jour l'affichage
      } catch (error) {
        console.error('Erreur réseau lors de la suppression de la conversation :', error);
      }
    }
  );
}

async function renderMessages() {
  const chatBox = document.getElementById('chat-box');
  chatBox.innerHTML = '';
  if (!currentConversationId) {
    toggleWelcomeScreen(); // Mettre à jour l'affichage
    return;
  }

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
    // Envoyer le message de l'utilisateur à l'API
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

    // Ajouter le message de l'utilisateur à l'interface utilisateur
    addMessageToChat(newMessage.sender, newMessage.message);

    // Réinitialiser le champ d'entrée
    userInput.value = '';

    // Attendre la réponse de l'IA
    const aiResponse = await fetch(`http://localhost:5000/api/conversations/${currentConversationId}/ai-response`, {
      method: 'GET',
    });

    if (!aiResponse.ok) {
      console.error('Erreur lors de la récupération de la réponse de l\'IA');
      return;
    }

    const aiMessage = await aiResponse.json();

    // Ajouter la réponse finale de l'IA à l'interface utilisateur
    addMessageToChat(aiMessage.sender, aiMessage.message);

    // Afficher le raisonnement dans la div #reasoning
    const reasoningDiv = document.getElementById('reasoning');
    reasoningDiv.textContent = aiMessage.reasoning;
    reasoningDiv.style.display = 'block'; // Afficher la div
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
      toggleWelcomeScreen(); // Mettre à jour l'affichage
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

function toggleWelcomeScreen() {
  const welcomeScreen = document.getElementById('welcome-screen');
  const chatContainer = document.getElementById('chat-container');

  if (!currentConversationId) {
    welcomeScreen.style.display = 'flex'; // Afficher la page d'accueil
    chatContainer.style.display = 'none'; // Masquer le conteneur de chat
  } else {
    welcomeScreen.style.display = 'none'; // Masquer la page d'accueil
    chatContainer.style.display = 'flex'; // Afficher le conteneur de chat
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar.style.width === '50px') {
    sidebar.style.width = '200px';
    document.getElementById('conversation-list').style.display = 'block';
  } else {
    sidebar.style.width = '50px';
    document.getElementById('conversation-list').style.display = 'none';
  }
}

function quitConversation() {
  currentConversationId = null; // Réinitialiser l'ID de la conversation courante
  toggleWelcomeScreen(); // Afficher la page d'accueil
  const chatBox = document.getElementById('chat-box');
  chatBox.innerHTML = ''; // Réinitialiser le contenu du chat
}

// Initial call to fetch conversations and set chat container visibility
fetchConversations();
toggleNoConversationMessage();
toggleChatContainer();
