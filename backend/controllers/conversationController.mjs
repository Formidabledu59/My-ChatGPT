// backend/controllers/conversationController.mjs
import fetch from 'node-fetch';
import pool from '../dbConfig.mjs';

const addMessage = async (req, res) => {
  const { conversationId } = req.params;
  const { sender, text } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO message (idConv, sender, message) VALUES (?, ?, ?)',
      [conversationId, sender, text]
    );
    const newMessage = { id: result.insertId, idConv: conversationId, sender, message: text };
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).send('Server Error');
  }
};

const getConversations = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM conversations');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).send('Server Error');
  }
};

const createConversation = async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO conversations (titre) VALUES (?)', [name]);
    const newConversation = { id: result.insertId, titre: name };
    res.status(201).json(newConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).send('Server Error');
  }
};

const getMessages = async (req, res) => {
  const { conversationId } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM message WHERE idConv = ?', [conversationId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).send('Server Error');
  }
};

const getAIResponse = async (req, res) => {
  const { conversationId } = req.params;

  try {
    // Récupérer le dernier message de la conversation
    const [rows] = await pool.query(
      'SELECT message FROM message WHERE idConv = ? ORDER BY id DESC LIMIT 1',
      [conversationId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Aucun message trouvé pour cette conversation.' });
    }

    const lastMessage = rows[0].message;

    // Ajouter une instruction pour des réponses concises
    const prompt = `Réponds de manière concise et pertinente (en français et en moins de 255 caracteres.) : ${lastMessage}`;

    // Appeler l'API Hugging Face pour obtenir une réponse IA
    const MODEL_NAME = "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B"; // Nom du modèle
    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL_NAME}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API Hugging Face:', errorText);
      return res.status(500).json({ error: 'Erreur lors de la génération de la réponse IA' });
    }

    const result = await response.json();
    const aiResponse = result[0]?.generated_text || 'Désolé, je ne peux pas répondre pour le moment.';

    // Séparer le raisonnement et la réponse finale
    const reasoningEndIndex = aiResponse.indexOf('</think>');
    let reasoning = '';
    let finalResponse = aiResponse;

    if (reasoningEndIndex !== -1) {
      reasoning = aiResponse.substring(0, reasoningEndIndex).trim(); // Extraire le raisonnement

      // Extraire la réponse finale en ignorant ">" et le saut de ligne après "</think>"
      const responseStartIndex = reasoningEndIndex + 7; // Longueur de "</think>"
      finalResponse = aiResponse.substring(responseStartIndex).replace(/^\s*>\s*/, '').trim();
    }

    // Enregistrer uniquement la réponse finale dans la base de données
    const [insertResult] = await pool.query(
      'INSERT INTO message (idConv, sender, message) VALUES (?, ?, ?)',
      [conversationId, 'AI', finalResponse]
    );

    // Retourner la réponse finale et le raisonnement séparément
    res.json({
      id: insertResult.insertId,
      sender: 'AI',
      message: finalResponse,
      reasoning: reasoning, // Inclure le raisonnement pour le frontend
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la réponse IA:', error);
    res.status(500).send('Erreur serveur');
  }
};

const updateConversationName = async (req, res) => {
  const { conversationId } = req.params;
  const { name } = req.body;

  try {
    await pool.query('UPDATE conversations SET titre = ? WHERE id = ?', [name, conversationId]);
    res.status(200).send('Conversation mise à jour avec succès');
  } catch (error) {
    console.error('Erreur lors de la mise à jour du nom de la conversation :', error);
    res.status(500).send('Erreur serveur');
  }
};

const deleteConversation = async (req, res) => {
  const { conversationId } = req.params;

  try {
    // Supprimer les messages associés à la conversation
    await pool.query('DELETE FROM message WHERE idConv = ?', [conversationId]);

    // Supprimer la conversation elle-même
    const [result] = await pool.query('DELETE FROM conversations WHERE id = ?', [conversationId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }

    res.status(200).send('Conversation supprimée avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression de la conversation :', error);
    res.status(500).send('Erreur serveur');
  }
};

export { addMessage, getConversations, createConversation, getMessages, getAIResponse, updateConversationName, deleteConversation };

