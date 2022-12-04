const { deterministicPartitionKey } = require("./dpk");
const crypto = require("crypto");


describe("deterministicPartitionKey", () => {
  it("Returns the literal '0' when given no input", () => {
    const trivialKey = deterministicPartitionKey();

    expect(trivialKey).toBe("0");
  });

  it("Returns the unhashed partition key if it already exists and it is not greater than the MAX_PARTITION_KEY_LENGTH", () => {
    const partitionKey = deterministicPartitionKey({partitionKey: 'partition_key'});

    expect(partitionKey).toBe("partition_key");
    expect(partitionKey).not.toBe("0");
  });

  it("Returns the hashed event object if the partition key does not exist", () => {
    const data = { test: 'test' };
    const mockedCryptoFunction = {
      update: jest.fn().mockReturnThis(),
      digest: jest.fn(),
    };
    const mockedCreateHash = jest.spyOn(crypto, 'createHash').mockImplementationOnce(() => mockedCryptoFunction);

    deterministicPartitionKey(data);

    expect(mockedCreateHash).toBeCalledWith("sha3-512");
    expect(mockedCryptoFunction.update).toBeCalledWith(JSON.stringify(data));
    expect(mockedCryptoFunction.digest).toBeCalledWith("hex");
    mockedCreateHash.mockRestore();
  });

  it("Returns the JSON stringified partition key if the partition key exists and is not a string", () => {
    const partitionKey = 44;
    const mockedJsonStringify = jest.spyOn(JSON, 'stringify');

    deterministicPartitionKey({partitionKey});

    expect(mockedJsonStringify).toBeCalledWith(partitionKey);
    mockedJsonStringify.mockRestore();
  });

  it("Returns hashed partition key if partition key length is greater than MAX_PARTITION_KEY_LENGTH", () => {
    const partitionKey = 't'.repeat(260);

    const mockedCryptoFunction = {
      update: jest.fn().mockReturnThis(),
      digest: jest.fn(),
    };

    const mockedCreateHash = jest.spyOn(crypto, 'createHash').mockImplementationOnce(() => mockedCryptoFunction);

    deterministicPartitionKey({partitionKey});

    expect(mockedCreateHash).toBeCalledWith("sha3-512");
    expect(mockedCryptoFunction.update).toBeCalledWith(partitionKey);
    expect(mockedCryptoFunction.digest).toBeCalledWith("hex");
    mockedCreateHash.mockRestore();
  });
});
