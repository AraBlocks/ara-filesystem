pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

contract Storage {

  using SafeMath for uint256;

  address public owner;

  // 0 - metadata/tree file
  // 1 - metadata/signatures file
  // DID => file index => offset => buffer
  mapping (string => mapping(uint8 => Buffers)) buffer_mappings;

  struct Buffers {
    mapping (uint256 => bytes) buffers;
    uint256 largest_key;
    uint256[] keys;
  }

  event Commit(string _identity);
  event Delete(string _identity);

  constructor() public {
    owner = msg.sender;
  }
 
  modifier restricted() {
    if (msg.sender == owner) _;
  }

  function write(string identity, uint8 file, uint256 offset, bytes buffer, bool last_write) public restricted {
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
    return buffer_mappings[identity][0].keys.length > 0;
  }

  function read(string identity, uint8 file, uint256 offset) public view returns (bytes buffer) {
    return buffer_mappings[identity][file].buffers[offset];
  }

  function stat(string identity, uint8 file) public view returns (uint256 length) {
    uint256 largest_key = buffer_mappings[identity][file].largest_key;
    if (largest_key == 0) {
      return 0;
    } else {
      return largest_key.add(buffer_mappings[identity][file].buffers[largest_key].length);
    }
  }

  function del(string identity) public restricted {
    for (uint8 i = 0; i < 3; i++) {
      uint256[] storage keys = buffer_mappings[identity][i].keys;
      for (uint256 j = 0; j < keys.length; j++) {
        delete buffer_mappings[identity][i].buffers[keys[j]];
      }
      delete buffer_mappings[identity][i];
    }
    emit Delete(identity);
  }
}
