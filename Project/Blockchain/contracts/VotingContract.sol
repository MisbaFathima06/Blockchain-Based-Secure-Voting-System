// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingContract {

    // Structure to store candidate details
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    // Mapping to store candidates using their ID
    mapping(uint => Candidate) public candidates;

    

    // Total number of candidates
    uint public candidatesCount;

    // Address of the owner (creator of the contract)
    address public owner;

    // Events to log important actions
    event Voted(uint candidateId); 
    event CandidateAdded(uint candidateId, string name);

    // Constructor to initialize the contract with a list of candidates
    constructor(string[] memory candidateNames) {
        owner = msg.sender; // The contract deployer is the owner
        for (uint i = 0; i < candidateNames.length; i++) {
            _addCandidate(candidateNames[i]);
        }
    }

    // Modifier to restrict certain functions to the owner only
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    // Internal function to add a candidate to the list
    function _addCandidate(string memory _name) internal {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        emit CandidateAdded(candidatesCount, _name); // Emit event when a candidate is added
    }

    // Public function to add a new candidate (only owner can do this)
    function addCandidate(string memory _name) public onlyOwner {
        _addCandidate(_name);
    }

    // Public function for voting; requires that the voter hasn't voted yet and the candidate ID is valid
    function vote(uint candidateId) public {
    // Ensure the candidate ID is valid
    require(candidateId > 0 && candidateId <= candidatesCount, "Invalid candidate ID.");

    // Increment the vote count for the selected candidate
    candidates[candidateId].voteCount++;

    emit Voted(candidateId); // Emit event when a vote is cast
}


    // Public function to get all candidates
    function getCandidates() public view returns (Candidate[] memory) {
        // Create an array to hold all the candidates
        Candidate[] memory allCandidates = new Candidate[](candidatesCount);
        
        for (uint i = 1; i <= candidatesCount; i++) {
            allCandidates[i - 1] = candidates[i]; // Populate the array with candidate data
        }
        
        return allCandidates; // Return the list of candidates
    }

    // Public function to get the winner based on vote count
    function getWinner() public view returns (string memory winnerName, uint winnerVotes) {
        uint highestVoteCount = 0;
        string memory winner;

        // Loop through all candidates to find the one with the highest vote count
        for (uint i = 1; i <= candidatesCount; i++) {
            if (candidates[i].voteCount > highestVoteCount) {
                highestVoteCount = candidates[i].voteCount;
                winner = candidates[i].name;
            }
        }
        
        return (winner, highestVoteCount); // Return the winner's name and vote count
    }
}
