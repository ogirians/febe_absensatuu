const express = require('express');
const app = express();
const cors = require('cors');
const port = 3001;
app.use(cors());

const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/absensatuu', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Define a schema for the Todo model
const todoSchema = new mongoose.Schema({
  text: String,
  completed: Boolean,
});
const jajanSchema = new mongoose.Schema({
  nama: String,
  shortname: String,
  qty : Number,
  harga : Number,
});
const transaksiSchema = new mongoose.Schema({
  tanggal: Date,
  nama_pembeli: String,
  jajan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Jajan',
    select: 'nama', // Reference to the Jajan model
  },
  jumlah : Number,
});

// Create a Todo model from the schema
const Todo = mongoose.model('Todo', todoSchema);
const Jajan= mongoose.model('Jajan', jajanSchema);
const Transaksi= mongoose.model('Transaksi', transaksiSchema);

app.use(express.json());

// Define routes for creating and retrieving todos
app.post('/jajan', async (req, res) => {
  try {
    const newJajan = new Jajan(req.body);
    await newJajan.save();
    res.status(201).json(newJajan);
  } catch (err) {
    res.status(500).json({ error: 'Error creating a new Jajan' });
  }
});

app.get('/jajan', async (req, res) => {
  try {
    const Jajans = await Jajan.find();
    res.json(Jajans);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching Jajans' });
  }
});

app.put('/jajan/:id', async (req, res) => {
  const id = req.params.id;
  const { nama, shortname, qty } = req.body;

  try {
    // Find the jajan by its ID
    const jajan = await Jajan.findById(id);

    if (!jajan) {
      return res.status(404).json({ error: 'Jajan not found' });
    }

    // Apply the changes
    if (nama !== undefined) {
      jajan.nama = nama;
    }

    if (shortname !== undefined) {
      jajan.shortname = shortname;
    }

    if (qty !== undefined) {
      jajan.qty = qty;
    }

    // Save the updated jajan
    await jajan.save();

    res.json(jajan);
  } catch (err) {
    res.status(500).json({ error: 'Error updating the jajan' });
  }
});

app.delete('/jajan/:id', async (req, res) => {
  const id = req.params.id;

  try {
    // Find the jajan by its ID and remove it
    const deletedJajan = await Jajan.findByIdAndRemove(id);

    if (!deletedJajan) {
      return res.status(404).json({ error: 'Jajan not found' });
    }

    res.json({ message: 'Jajan deleted successfully', deletedJajan });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting the jajan' });
  }
});

app.put('/jajan/terjual/:id', async (req, res) => {
  const id = req.params.id;
  const { jumlah } = req.body;
  console.log(jumlah);
  try {
    // Find the jajan by its ID
    const jajan = await Jajan.findById(id);

    if (!jajan) {
      return res.status(404).json({ error: 'Jajan not found' });
    }

    // Apply the changes
    if (jumlah !== undefined) {
      jajan.qty = jajan.qty - jumlah;
    }

    // Save the updated jajan
    await jajan.save();

    res.json(jajan);
  } catch (err) {
    res.status(500).json({ error: 'Error updating the jajan' });
  }
});

app.post('/transaksi', async (req, res) => {
  try {
    const newJajan = new Transaksi(req.body);
    await newJajan.save();
    res.status(201).json(newJajan);
  } catch (err) {
    res.status(500).json({ error: 'Error creating a new Jajan' });
  }
});

app.get('/transaksi', async (req, res) => {
  try {
    const Transaksis = await Transaksi.find();
    res.json(Transaksis);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching Transaksis' });
  }
});

app.get('/penjualan/:id', async (req, res) => {
  const id = req.params.id;
    try {
      const Penjualan =  await Transaksi.findById(id).populate({
        path: 'jajan',
        select: 'nama shortname',
      }) // Populate the 'jajan_id' field with data from the Jajan collection
      res.json(Penjualan);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching Transaksis' });
  }
});






app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});