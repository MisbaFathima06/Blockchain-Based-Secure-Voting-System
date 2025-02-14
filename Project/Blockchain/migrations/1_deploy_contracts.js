const VotingContract = artifacts.require("VotingContract");

module.exports = function (deployer) {
  // Initialize with a list of candidate names
  const initialCandidates = ["Alice", "Bob", "Charlie"];

  // Deploy the VotingContract with initial candidates
  deployer.deploy(VotingContract, initialCandidates)
    .then(async (instance) => {
      console.log("VotingContract deployed at address:", instance.address);

      // Optionally, add more candidates after deployment if needed
      // instance.addCandidate("Dave", { from: accounts[0] });
    });
};
