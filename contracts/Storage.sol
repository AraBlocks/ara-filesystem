pragma solidity ^0.4.24;

contract Storage {

  address public owner;

  // 0 - content/tree file
  // 1 - content/signatures file
  // 2 - metadata/tree file
  // 3 - metadata/signatures file
  // DID => file index => offset => buffer
  mapping (string => mapping(uint8 => Buffers)) buffer_mappings;

  struct Buffers {
    mapping (uint => bytes) buffers;
    uint largest_key;
    uint[] keys;
  }

  event Commit(string _identity);
  event Delete(string _identity);

  constructor() public {
    owner = msg.sender;
  }
 
  modifier restricted() {
    if (msg.sender == owner) _;
  }

  function write(string identity, uint8 file, uint8 offset, bytes buffer, bool last_write) public restricted {
    buffer_mappings[identity][file].buffers[offset] = buffer;
    buffer_mappings[identity][file].keys.push(offset);
    if (offset > buffer_mappings[identity][file].largest_key) {
      buffer_mappings[identity][file].largest_key = offset;
    }
    if (last_write) {
      emit Commit(identity);
    }
  }

  function read(string identity, uint8 file, uint8 offset) public view returns (bytes buffer) {
    return buffer_mappings[identity][file].buffers[offset];
  }

  function stat(string identity, uint8 file) public view returns (uint length) {
    uint largest_key = buffer_mappings[identity][file].largest_key;
    if (largest_key == 0) {
      return 0;
    } else {
      return largest_key + buffer_mappings[identity][file].buffers[largest_key].length;
    }
  }

  function del(string identity) public restricted {
    for (uint8 i = 0; i < 3; i++) {
      uint[] storage keys = buffer_mappings[identity][i].keys;
      for (uint j = 0; j < keys.length; j++) {
        delete buffer_mappings[identity][i].buffers[keys[j]];
      }
      delete buffer_mappings[identity][i];
    }
    emit Delete(identity);
  }
}
