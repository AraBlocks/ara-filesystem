pragma solidity ^0.4.24;

import "bytes/BytesLib.sol";

contract Storage {

  using BytesLib for bytes;

  address public owner;

  // 0 - metadata/tree file
  // 1 - metadata/signatures file
  // DID => file index => offset => buffer
  mapping (string => mapping(uint8 => Buffers)) buffer_mappings;

  struct Buffers {
    mapping (uint256 => bytes) buffers;
    uint256[] keys;
    bool invalid;
  }

  event WriteAttempt(uint _bufferLength, uint256 _offset, uint8 _size);
  event Commit(string _identity);
  event MarkedInvalid(string _identity);

  constructor() public {
    owner = msg.sender;
  }
 
  modifier restricted() {
    require (msg.sender == owner);
    _;
  }

  function write(string identity, uint8 file, uint256[] offsets, 
    uint8[] sizes, bytes buffer) public restricted {

    require(offsets.length == sizes.length);
    require(!buffer_mappings[identity][file].invalid);

    for (uint i = 0; i < offsets.length; i++) {
      uint256 offset = offsets[i];
      uint8 size = sizes[i];
      bytes memory slice = buffer.slice(offset, size);
      buffer_mappings[identity][file].buffers[offsets[i]] = slice;
      buffer_mappings[identity][file].keys.push(offset);
    }
  }

  function exists(string identity) public view returns (bool doesExist) {
    return buffer_mappings[identity][0].keys.length > 0 
      && !buffer_mappings[identity][0].invalid;
  }

  function read(string identity, uint8 file, uint256 offset) public view returns (bytes buffer) {
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
