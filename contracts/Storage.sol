pragma solidity ^0.4.24;

contract Storage {

  address public owner;

  // 0 - metadata/tree file
  // 1 - metadata/signatures file
  // DID => file index => offset => buffer
  mapping (string => mapping(uint8 => Buffers)) buffer_mappings;

  struct Buffers {
    mapping (uint256 => bytes) buffers;
    uint256 largest_key;
    uint256[] keys;
    bool invalid;
  }

  event Commit(string _identity);
  event MarkedInvalid(string _identity);

  constructor() public {
    owner = msg.sender;
  }
 
  modifier restricted() {
    if (msg.sender == owner) _;
  }

  function write(string identity, uint8 file, uint8 offset, bytes buffer, bool last_write) public restricted {
    // make sure AFS hasn't been removed
    require(!buffer_mappings[identity][file].invalid);

    buffer_mappings[identity][file].buffers[offset] = buffer;
    buffer_mappings[identity][file].keys.push(offset);
    if (offset > buffer_mappings[identity][file].largest_key) {
      buffer_mappings[identity][file].largest_key = offset;
    }

    if (last_write) {
      emit Commit(identity);
    }
  }

  function exists(string identity) public view returns (bool doesExist) {
    return buffer_mappings[identity][0].keys.length > 0 
      && !buffer_mappings[identity][0].invalid;
  }

  function read(string identity, uint8 file, uint8 offset) public view returns (bytes buffer) {
    if (buffer_mappings[identity][file].invalid) {
      return ""; // empty bytes
    }
    return buffer_mappings[identity][file].buffers[offset];
  }

  function del(string identity) public restricted {
    buffer_mappings[identity][0].invalid = true;
    buffer_mappings[identity][1].invalid = true;
    emit MarkedInvalid(identity);
  }
}
