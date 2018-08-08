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

  event Write(string _identity);
  event Append(string _identity);
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
    
    uint256 maxOffsetLength = mtOffsets.length > msOffsets.length ? mtOffsets.length : msOffsets.length;

    for (uint i = 0; i < maxOffsetLength; i++) {
      // metadata/tree
      if (i <= mtOffsets.length - 1) {
        buffer_mappings[identity][0].buffers[mtOffsets[i]] = mtBuffer.slice(i * mtBufferSize, mtBufferSize);
      }

      // metadata/signatures
      if (i <= msOffsets.length - 1) {
        buffer_mappings[identity][1].buffers[msOffsets[i]] = msBuffer.slice(i * msBufferSize, msBufferSize);
      }
    }

    emit Append(identity);
  }

  function write(string identity, uint256[] mtOffsets, uint256[] msOffsets,
    uint8[] mtSizes, uint8[] msSizes, bytes mtBuffer, bytes msBuffer) public restricted {

    require(!buffer_mappings[identity][0].invalid);
    require(mtOffsets.length == mtSizes.length && msOffsets.length == msSizes.length);

    uint256 maxOffsetLength = mtOffsets.length > msOffsets.length ? mtOffsets.length : msOffsets.length;

    for (uint i = 0; i < maxOffsetLength; i++) {
      // metadata/tree
      if (i <= mtOffsets.length - 1) {
        buffer_mappings[identity][0].buffers[mtOffsets[i]] = mtBuffer.slice(mtOffsets[i], mtSizes[i]);
      }
      
      // metadata/signatures
      if (i <= msOffsets.length - 1) {
        buffer_mappings[identity][1].buffers[msOffsets[i]] = msBuffer.slice(msOffsets[i], msSizes[i]);
      }
    }

    emit Write(identity);
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
