var bitcore = require("bitcore-explorers/node_modules/bitcore-lib");
//Generating the source address

const value = new Buffer.from(
  "way to generate an address--jfnvjdsnfbbsdfbksjndkjfbdssdj!!!"
);
const hash = bitcore.crypto.Hash.sha256(value);
const bn = bitcore.crypto.BN.fromBuffer(hash);
const address = new bitcore.PrivateKey(bn, "testnet").toAddress().toString();
console.log(address);

const sendBitcoin = async (receiverAddress, amountToSend) => {
  const sochain_network = "BTCTEST";
  const privateKey = "93F2mUJPKbXW8Q9cMNz4ZmpsjgTbNjrMeCaUesTPE7k1DFhSmnk";
  const sourceAddress = address;

  const satoshiToSend = amountToSend * 100000000;
  let fee = 0;
  let inputCount = 0;
  let outputCount = 2;
  const utxos = await axios.get(
    `https://sochain.com/api/v2/get_tx_unspent/${sochain_network}/${sourceAddress}`
  );
  const transaction = new bitcore.Transaction();
  let totalAmountAvailable = 0;
  let inputs = [];
  utxos.data.data.txs.forEach(async (element) => {
    let utxo = {};
    utxo.satoshis = Math.floor(Number(element.value) * 100000000);
    utxo.script = element.script_hex;
    utxo.address = utxos.data.data.address;
    utxo.txId = element.txid;
    utxo.outputIndex = element.output_no;
    totalAmountAvailable += utxo.satoshis;
    inputCount += 1;
    inputs.push(utxo);
  });

  //Calculating the transaction size for the transaction fee
  transactionSize = inputCount * 146 + outputCount * 34 + 10 - inputCount;

  fee = transactionSize * 20;
  //Check if we have enough satoshis to send
  if (totalAmountAvailable - satoshiToSend - fee < 0) {
    throw new Error("Balance is low for this transaction");
  }

  //Set transaction input
  transaction.from(inputs);

  // Receiving address and amount to be sent is set
  transaction.to(receiverAddress, satoshiToSend);

  // Change address is set which is the source address from which we send the bitcoins for transaction
  transaction.change(sourceAddress);

  //Transaction fees is set to 20 satoshis per byte
  transaction.fee(fee * 20);

  // Signing transaction with private key
  transaction.sign(privateKey);

  // Serializing transactions
  const serializedTransaction = transaction.serialize();
  // Sending the transaction
  const result = await axios({
    method: "POST",
    url: `https://sochain.com/api/v2/send_tx/${sochain_network}`,
    data: {
      tx_hex: serializedTX,
    },
  });
  return result.data.data;
};
