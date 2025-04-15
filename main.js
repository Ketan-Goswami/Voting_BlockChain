let WALLET_CONNECTED = "";
let contractAddress = "0xAe6Badc921B7c12cED3BBE10a72b20BdEE23e20f";
let contractAbi = [
    {
      "inputs": [
        {
          "internalType": "string[]",
          "name": "_candidateNames",
          "type": "string[]"
        },
        {
          "internalType": "uint256",
          "name": "_durationInMinutes",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
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
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "candidates",
      "outputs": [
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
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllVotesOfCandiates",
      "outputs": [
        {
          "components": [
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
          "internalType": "struct Voting.Candidate[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getRemainingTime",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getVotingStatus",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_candidateIndex",
          "type": "uint256"
        }
      ],
      "name": "vote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "voters",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "votingEnd",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "votingStart",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

const connectMetamask = async() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    WALLET_CONNECTED = await signer.getAddress();
    var element = document.getElementById("metamasknotification");
    element.innerHTML = "Metamask is connected " + WALLET_CONNECTED;
}

const addVote = async () => {
  const cand = document.getElementById("cand");

  if (!WALLET_CONNECTED) {
      cand.innerHTML = "Please connect Metamask first.";
      return;
  }

  const index = document.getElementById("vote").value;
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, contractAbi, signer);

  try {
      const votingOpen = await contract.getVotingStatus();
      if (!votingOpen) {
          cand.innerHTML = "Voting period has ended or not started yet.";
          return;
      }

      const candidates = await contract.getAllVotesOfCandiates();

      if (!index || isNaN(index) || index < 0 || index >= candidates.length) {
          cand.innerHTML = `Invalid candidate index. Please choose between 0 and ${candidates.length - 1}.`;
          return;
      }

      cand.innerHTML = "Submitting vote...";

      const hasVoted = await contract.voters(WALLET_CONNECTED);
        if (hasVoted) {
            cand.innerHTML = "You have already voted.";
            return;
        }

      const tx = await contract.vote(index);
      await tx.wait();
      cand.innerHTML = "Vote successfully recorded.";

  } catch (error) {
    console.error("Voting error:", error);

    let msg = "";

    if (error?.error?.message) msg = error.error.message;
    else if (error?.reason) msg = error.reason;
    else if (error?.message) msg = error.message;
    else msg = error.toString();

    if (msg.toLowerCase().includes("already voted")) {
        cand.innerHTML = "You have already voted.";
    } else if (msg.toLowerCase().includes("voting has not started")) {
        cand.innerHTML = "Voting has not started yet.";
    } else {
        cand.innerHTML = "An error occurred while voting.";
    }
  }
}


const voteStatus = async() => {
    if(WALLET_CONNECTED != 0) {
        var status = document.getElementById("status");
        var remainingTime = document.getElementById("time");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        const currentStatus = await contractInstance.getVotingStatus();
        let time = parseInt(await contractInstance.getRemainingTime(), 16);
        const formatTime = (seconds) => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            return `${hours}h ${minutes}m ${secs}s`;
        };
        
        status.innerHTML = currentStatus == 1 ? "Voting is currently open" : "Voting is finished";
        remainingTime.innerHTML = `Remaining time: ${formatTime(time)}`;
        
        // Update time every second if voting is open
        if (currentStatus == 1) {
            setInterval(async () => {
                time = Math.max(0, time - 1);
                remainingTime.innerHTML = `Remaining time: ${formatTime(time)}`;
                if (time <= 0) {
                    status.innerHTML = "Voting is finished";
                }
            }, 1000);
        }
    }
    else {
        var status = document.getElementById("status");
        status.innerHTML = "Please connect metamask first";
    }
}

const getAllCandidates = async() => {
    var p3 = document.getElementById("p3");

    if (!WALLET_CONNECTED) {
        p3.innerHTML = "Please connect MetaMask first.";
        return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
    p3.innerHTML = "Please wait, getting all the candidates from the voting smart contract";
    var candidates = await contractInstance.getAllVotesOfCandiates();
    console.log(candidates);
    var table = document.getElementById("myTable");

    // Clear existing table rows
    // table.innerHTML = "";

    for (let i = 0; i < candidates.length; i++) {
        var row = table.insertRow();
        var idCell = row.insertCell();
        var nameCell = row.insertCell();
        var vc = row.insertCell();

        idCell.innerHTML = i;
        nameCell.innerHTML = candidates[i].name;
        vc.innerHTML = candidates[i].voteCount;
    }

    p3.innerHTML = "The Candidate list is updated";
  
}
