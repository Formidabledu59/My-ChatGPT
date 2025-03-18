// backend/Express.mjs
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import conversationRoutes from './routes/conversationRoutes.mjs';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use('/api/conversations', conversationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});