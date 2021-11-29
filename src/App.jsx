import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/GreetingsPortal.json";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [totalGreetings, setTotalGreetings] = useState(0);
  const [allGreetings, setAllGreetings] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);

  const contractAddress = "0x6c56632049Ed778A7F379682ea933800D86503Bc";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const greetingsPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        let count = await greetingsPortalContract
          .getGreetingCount()
          .then((response) => {
            return response[0];
          });
        console.log("Retrieved total greet count...", count.toNumber());
        getAllGreets();
        setTotalGreetings(count.toNumber());
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      getAllGreets();
    } catch (error) {
      console.log(error);
    }
  };

  const getAllGreets = async () => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const greetingsPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const greets = await greetingsPortalContract.getAllGreets();

        let newGreets = greets.map((greet) => {
          return {
            address: greet.greeter,
            message: greet.message,
            timestamp: new Date(greet.timestamp * 1000),
          };
        });

        setAllGreetings(newGreets);
        console.log(newGreets);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const greet = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const greetingsPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await greetingsPortalContract
          .getGreetingCount()
          .then((response) => {
            return response[0];
          });
        console.log("Retrieved total greet count...", count.toNumber());

        const greetTxn = await greetingsPortalContract.greet(currentMessage, {
          gasLimit: 300000,
        });
        console.log("Mining...", greetTxn.hash);
        document.getElementById("test").style.filter = "blur(5px)";
        setShowModal(true);

        await greetTxn.wait();
        console.log("Mined -- ", greetTxn.hash);
        setShowModal(false);
        setShowModal2(true);
        setCurrentMessage("");

        count = await greetingsPortalContract
          .getGreetingCount()
          .then((response) => {
            return response[0];
          });
        console.log("Retrieved total greet count...", count.toNumber());

        setTotalGreetings(count.toNumber());
        getAllGreets();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  });

  return (
    <div className="mainContainer">
      <div className="dataContainer" id="test">
        <div className="header">
          <span role="img" aria-label="wave">
            🙋👋
          </span>{" "}
          Greetings Portal
        </div>

        <div className="bio">
          WAZZZUPPP! I am Subho, a Software Engineer! Nice to meet you! Select
          the Rinkeby Test Network and connect your Ethereum Wallet to GREET ME!
          30% chance of winning some ETH! Please Don't Spam (5 Minute Cooldown)
        </div>

        {currentAccount && (
          <div className="greetBox">
            <label>
              Type your Greetings:
              <p> </p>
              <textarea
                rows="4"
                cols="60"
                placeholder="Surprise me..."
                type="textbox"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
              />
            </label>
            <button className="greetButton" onClick={greet}>
              <span role="img" aria-label="greet">
                Greet 🙏
              </span>
            </button>
          </div>
        )}

        {!currentAccount && (
          <button className="greetButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {totalGreetings !== 0 && (
          <div className="bio" style={{ fontSize: "15px" }}>
            I have received {totalGreetings} greetings so far!
          </div>
        )}

        <div className="allGreetDisplay">
          {allGreetings.map((greet, index) => {
            return (
              <div
                key={index}
                style={{
                  backgroundColor: "OldLace",
                  marginTop: "16px",
                  padding: "8px",
                }}
              >
                <div>
                  <strong>Wallet Address:</strong> {greet.address}
                </div>
                <div>
                  <strong>Message:</strong> {greet.message}
                </div>
                <div>
                  <strong>Time:</strong>
                  {greet.timestamp.toString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {showModal && (
        <div className="modalBox">
          <h3>Thank you for your Greetings</h3>
          <h2>Loading...</h2>
          <img
            src="https://media1.giphy.com/media/3oeHLhzRkRX1bQQBPi/giphy.gif?cid=ecf05e47euidil1i7ex4pfabin6f8qeb1wriorfq87usyifk&rid=giphy.gif&ct=g"
            width="150px"
            alt="loading"
          />
        </div>
      )}
      {showModal2 && (
        <div className="modalBox">
          <img
            src="https://media0.giphy.com/media/8UF0EXzsc0Ckg/giphy.gif?cid=ecf05e47dqqtyxbh14ojyjtfngssqrc76dife2vlg76d5yb9&rid=giphy.gif&ct=g"
            width="150px"
            alt="finished"
          />
          <button
            style={{ marginTop: "10px" }}
            onClick={() => {
              setShowModal2(false);
              document.getElementById("test").style.filter = "blur(0)";
            }}
          >
            {" "}
            OK{" "}
          </button>
        </div>
      )}
      {currentAccount && (
        <div>
          <div className="accountBox">
            <center>
              <strong> Your Account: </strong> {currentAccount}
            </center>
          </div>
          <div
            className="accountBox"
            style={{ bottom: "480px", fontSize: "8px" }}
          >
            <center>
              <strong>Feeling Generous? Send Me Actual Crypto!</strong>
              <p>
                <strong>ETH:</strong> 0x018FfDB9Efbc739E5b47b45e93eB28c7501f0876
              </p>
              <p>
                <strong>SOL:</strong>{" "}
                8GVLNDhrSeHG8PF1tX7VdgM9bH41ims1CgP5hXdCoN8e
              </p>
            </center>
          </div>
        </div>
      )}
    </div>
  );
}
