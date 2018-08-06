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
    bool invalid;
  }

  event Commit(string _identity);
  event MarkedInvalid(string _identity);

  uint8 constant mtBufferSize = 40;
  uint8 constant msBufferSize = 64;

  constructor() public {
    owner = msg.sender;
  }
 
  modifier restricted() {
    require (msg.sender == owner);
    _;
  }

  function append(string identity, uint256[] mtOffsets, uint256[] msOffsets,
    bytes mtBuffer, bytes msBuffer) public restricted {

    require(!buffer_mappings[identity][0].invalid);

    uint256 offset;
    bytes memory slice;
    for (uint i = 0; i < mtOffsets.length; i++) {
      offset = mtOffsets[i];
      slice = mtBuffer.slice(i * mtBufferSize, mtBufferSize);
      buffer_mappings[identity][0].buffers[offset] = slice;
    }

    for (uint j = 0; j < msOffsets.length; j++) {
      offset = msOffsets[j];
      slice = msBuffer.slice(j * msBufferSize, msBufferSize);
      buffer_mappings[identity][1].buffers[offset] = slice;
    }

    emit Commit(identity);
  }

  function write(string identity, uint256[] mtOffsets, uint256[] msOffsets,
    uint8[] mtSizes, uint8[] msSizes, bytes mtBuffer, bytes msBuffer) public restricted {

    require(!buffer_mappings[identity][0].invalid);
    require(mtOffsets.length == mtSizes.length && msOffsets.length == msSizes.length);

    uint256 offset;
    uint8 size;
    bytes memory slice;
    for (uint i = 0; i < mtOffsets.length; i++) {
      offset = mtOffsets[i];
      size = mtSizes[i];
      slice = mtBuffer.slice(offset, size);
      buffer_mappings[identity][0].buffers[offset] = slice;
    }

    for (uint j = 0; j < msOffsets.length; j++) {
      offset = msOffsets[j];
      size = msSizes[j];
      slice = msBuffer.slice(offset, size);
      buffer_mappings[identity][1].buffers[offset] = slice;
    }

    emit Commit(identity);
  }

  function hasBuffer(string identity, uint8 file, uint256 offset, bytes buffer) public view returns (bool exists) {
    return buffer_mappings[identity][file].buffers[offset].equal(buffer);
  }

  function exists(string identity) public view returns (bool doesExist) {
    return !buffer_mappings[identity][0].invalid;
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
