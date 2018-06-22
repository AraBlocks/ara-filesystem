pragma solidity ^0.4.24;

contract Storage {

  address public owner;

  // 0 - content/tree file
  // 1 - content/signatures file
  // 2 - metadata/tree file
  // 3 - metadata/signatures file
  mapping (string => mapping(uint8 => Buffers)) buffer_mappings;

  struct Buffers {
    mapping (uint => bytes) buffers;
  }

  event Write(string _identity);
  event Read(string _identity, uint offset);
  event Delete(string _identity);

  constructor() public {
    owner = msg.sender;
  }
 
  modifier restricted() {
    if (msg.sender == owner) _;
  }

  function write(string identity, uint8 file, uint offset, bytes buffer) public restricted {
    buffer_mappings[identity][file].buffers[offset] = buffer;
    emit Write(identity);
  }

  function read(string identity, uint8 file, uint offset) public view returns (bytes buffer) {
    emit Read(identity, offset);
    return buffer_mappings[identity][file].buffers[offset];
  }

  function stat(string identity, uint8 file) public view returns (uint length) {
    // TODO(cckelly)
    return 0;
  }

  function del(string identity) public restricted {
    for (uint8 i = 0; i < 4; i++) {
      delete buffer_mappings[identity][i];
    }
    emit Delete(identity);
  }
}
