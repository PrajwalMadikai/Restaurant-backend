import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mainRoute from './routes/mainRoute';
const app = express();
const PORT = process.env.PORT || 3000;

dotenv.config()

app.use(cors({
  origin:'*',
  methods: ['GET', 'POST', 'DELETE','PUT']
}))
app.use(express.json({ limit: '10mb' }));  
app.use(express.urlencoded({ limit: '10mb', extended: true }));

 
app.use('/',mainRoute)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});