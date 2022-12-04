const crypto = require("crypto");

exports.deterministicPartitionKey = (event) => {
  const MAX_PARTITION_KEY_LENGTH = 256;
  let determinedPartitionKey;

  if(event && event.partitionKey){
    determinedPartitionKey = event.partitionKey;
  } else if(event) {
    const data = JSON.stringify(event);
    determinedPartitionKey = crypto.createHash("sha3-512").update(data).digest("hex");
  }

  if(determinedPartitionKey && typeof determinedPartitionKey !== "string"){
    determinedPartitionKey = JSON.stringify(determinedPartitionKey);
  }else if (! determinedPartitionKey){
    determinedPartitionKey = "0";
  }

  return (determinedPartitionKey.length > MAX_PARTITION_KEY_LENGTH) ?
   crypto.createHash("sha3-512").update(determinedPartitionKey).digest("hex") 
   : determinedPartitionKey
};
