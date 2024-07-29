// pages/api/jobs.js

import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
const dbName = 'companies';

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

export default async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('jobs');
    const jobs = await collection.find({}).toArray();
    
    res.status(200).json({ jobs });
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch jobs' });
  } finally {
    // await client.close();
  }
};
