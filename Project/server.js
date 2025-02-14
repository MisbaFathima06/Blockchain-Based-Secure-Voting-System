// express: Used to create a web server
// mysql: to connect MySQL database
// cors: cross-origin requests
// body-parser: Middleware to parse incoming request bodies into JSON

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const Web3 = require('web3').default; // to connect to blockchain

const app = express(); //application
app.use(cors());
app.use(bodyParser.json());

// to connect to mysql db
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'voting_system'
  });

  db.connect(err => {
    if (err) {
      console.error('Error connecting to DB:', err);
      return;
    }
    console.log('Connected to MySQL Database');
  });


// Express server 
app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });



  // api to register voter

app.post('/register-voter', (req, res) => {
  const { name, voter_id } = req.body;  // extract name and voter id
  

  const checkQuery = 'SELECT * FROM voters WHERE voter_id = ?';    // this is checking if voteralready exists

  db.query(checkQuery, [voter_id], (err, result) => {
    if (err) return res.status(500).send({ message: 'Server error' });
    
    if (result.length > 0) {
      return res.status(400).send({ message: 'Voter ID already registered' });
    }

    // Entering voter id, name
    const insertQuery = 'INSERT INTO voters (name, voter_id, has_voted) VALUES (?, ?, false)';
    
    db.query(insertQuery, [name, voter_id], (err) => {
      if (err) return res.status(500).send({ message: 'Failed to register voter' });
      res.send({ message: 'Voter registered successfully' });
    });
  });
});


//api to verify voter already exists

app.post('/verify-voter', (req, res) => {
  const { voter_id } = req.body;     //tkaing data = voter id
  
  const query = 'SELECT * FROM voters WHERE voter_id = ? AND has_voted = false';

  db.query(query, [voter_id], (err, result) => {
    if (err) return res.status(500).send({ message: 'Server error' });
    
    if (result.length > 0) {
      res.send({ message: 'Voter verified', voter: result[0] });
    } 
    else {
      res.status(400).send({ message: 'Voter not found or already voted' });
    }
  });
});


// connection with blockchain for voting 

const web3 = new Web3('http://127.0.0.1:7545'); // Ensure Ganache or your Ethereum client is running
 // update it according to the local adress

// To connect to smart contracts
const contractABI = [ {
  "inputs": [
    {
      "internalType": "string[]",
      "name": "candidateNames",
      "type": "string[]"
    }
  ],
  "stateMutability": "nonpayable",
  "type": "constructor"
},
{
  "anonymous": false,
  "inputs": [
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "candidateId",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "string",
      "name": "name",
      "type": "string"
    }
  ],
  "name": "CandidateAdded",
  "type": "event"
},
{
  "anonymous": false,
  "inputs": [
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "candidateId",
      "type": "uint256"
    }
  ],
  "name": "Voted",
  "type": "event"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "name": "candidates",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "id",
      "type": "uint256"
    },
    {
      "internalType": "string",
      "name": "name",
      "type": "string"
    },
    {
      "internalType": "uint256",
      "name": "voteCount",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function",
  "constant": true
},
{
  "inputs": [],
  "name": "candidatesCount",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function",
  "constant": true
},
{
  "inputs": [],
  "name": "owner",
  "outputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "stateMutability": "view",
  "type": "function",
  "constant": true
},
{
  "inputs": [
    {
      "internalType": "string",
      "name": "_name",
      "type": "string"
    }
  ],
  "name": "addCandidate",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "candidateId",
      "type": "uint256"
    }
  ],
  "name": "vote",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [],
  "name": "getCandidates",
  "outputs": [
    {
      "components": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "voteCount",
          "type": "uint256"
        }
      ],
      "internalType": "struct VotingContract.Candidate[]",
      "name": "",
      "type": "tuple[]"
    }
  ],
  "stateMutability": "view",
  "type": "function",
  "constant": true
},
{
  "inputs": [],
  "name": "getWinner",
  "outputs": [
    {
      "internalType": "string",
      "name": "winnerName",
      "type": "string"
    },
    {
      "internalType": "uint256",
      "name": "winnerVotes",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function",
  "constant": true
} ];  //____________________________Application Binary Interface (ABI) of your deployed smart contract________________________________________________

const contractAddress = '0x1E7c4424E12f1BE127735d74B5F64B953cA8cDD8'; //_______________________Replace with deployed address of your smart contract on the blockchain_________________________________


const votingContract = new web3.eth.Contract(contractABI, contractAddress);





const privateKey = '0xcf4cebe76367147270a15c006a5062177983e3a0621399cb1b08a6c00149b06c'; // Replace with your actual private key

// Recursive function to convert BigInt values in objects
const convertBigInt = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(convertBigInt);

  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = typeof obj[key] === 'bigint' ? obj[key].toString() : convertBigInt(obj[key]);
    return acc;
  }, {});
};

// Voing api starts from here
app.post('/vote', async (req, res) => {
  const { voter_id, candidate_id } = req.body;

  // Check if the voter exists in the DB and has not voted
  const query = 'SELECT * FROM voters WHERE voter_id = ? AND has_voted = false';
  db.query(query, [voter_id], async (err, result) => {
    if (err) {
      return res.status(500).send({ message: 'Database query error', error: err.message });
    }

    if (result.length === 0) {
      return res.status(400).send({ message: 'Voter not eligible or has already voted' });
    }

    try {
      // Update voter status in the DB before casting the vote (marking as voted)
      const updateQuery = 'UPDATE voters SET has_voted = true WHERE voter_id = ?';
      db.query(updateQuery, [voter_id], async (err) => {
        if (err) {
          return res.status(500).send({ message: 'Failed to update voter status in DB', error: err.message });
        }

        // Interact with the blockchain to cast the vote
        const transaction = await votingContract.methods
          .vote(candidate_id)
          .send({ from: '0xc6E658714C8e432230a8dD2651Cf3557aaf44B56', gas: 3000000 }); // Ethereum Account

        // Convert BigInt fields in the transaction to strings using the recursive function
        const formattedTransaction = convertBigInt(transaction);

        // Send the response with the transaction details
        res.send({
          message: 'Vote successfully cast and recorded on blockchain',
          transaction: formattedTransaction
        });
      });
    } catch (error) {
      res.status(500).send({ message: 'Blockchain transaction failed', error: error.message });
    }
  });
});



// Results API to fetch all candidates and the winner from the blockchain
app.get('/results', async (req, res) => {
  try {
    // Fetch all candidates from the smart contract
    const candidates = await votingContract.methods.getCandidates().call();

    // Log to check the structure of candidates
    console.log('Candidates from contract:', candidates);

    // Ensure that candidates are in an array and clean BigInt values
    const cleanedCandidates = Array.isArray(candidates)
      ? candidates
      : Object.values(candidates); // Convert to array if it's not

    // Clean and format candidates, convert BigInt values to strings
    const formattedCandidates = cleanedCandidates.map(candidate => ({
      id: candidate.id.toString(), // Convert BigInt to string
      name: candidate.name,
      voteCount: candidate.voteCount.toString() // Convert BigInt to string
    }));

    // Log to check the cleaned candidates before sending
    console.log('Cleaned Candidates:', formattedCandidates);

    // Fetch the winner from the smart contract
    const winnerData = await votingContract.methods.getWinner().call();

    // Log the raw winner data
    console.log('Winner data from contract:', winnerData);

    // Extract winner data from the returned object
    const winnerName = winnerData.winnerName || winnerData[0]; // First property or 0th index
    const winnerVotes = winnerData.winnerVotes || winnerData[1]; // Second property or 1st index

    // Format the winner data
    const winner = {
      name: winnerName,
      vote_count: winnerVotes ? winnerVotes.toString() : '0' // Ensure winner vote count is a string
    };

    console.log('Formatted Winner:', winner);

    // Send the response with candidates and the winner
    res.send({
      candidates: formattedCandidates,
      winner: winner
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).send({ message: 'Failed to fetch results', error: error.message });
  }
});


// API for Adding Candidates
app.post('/add-candidate', async (req, res) => {
  const { name } = req.body;

  try {
    const accounts = await web3.eth.getAccounts();
    const receipt = await votingContract.methods.addCandidate(name).send({ from: accounts[0] });

    // Recursive function to convert BigInt values in objects
    const convertBigInt = (obj) => {
      if (typeof obj !== 'object' || obj === null) return obj;
      if (Array.isArray(obj)) return obj.map(convertBigInt);

      return Object.keys(obj).reduce((acc, key) => {
        acc[key] = typeof obj[key] === 'bigint' ? obj[key].toString() : convertBigInt(obj[key]);
        return acc;
      }, {});
    };

    const formattedReceipt = convertBigInt(receipt);

    res.send({ message: 'Candidate added successfully', transaction: formattedReceipt });
  } catch (error) {
    res.status(500).send({ message: 'Failed to add candidate', error: error.message });
  }
});



// Api to list candidates
app.get('/list-candidates', async (req, res) => {
  try {
    const candidates = await votingContract.methods.getCandidates().call();

    const formattedCandidates = candidates.map(candidate => ({
      id: Number(candidate.id),              // Convert BigInt to Number
      name: candidate.name,
      voteCount: Number(candidate.voteCount) // Convert BigInt to Number
    }));

    res.send({ candidates: formattedCandidates });
  } catch (error) {
    res.status(500).send({ message: 'Failed to fetch candidates', error: error.message });
  }
});

