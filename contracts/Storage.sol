pragma solidity ^0.4.24;

contract Storage {

  address public owner;

  // 0 - content/tree file
  // 1 - content/signatures file
  // 2 - metadata/tree file
  // 3 - metadata/signatures file
  mapping (string => mapping(uint8 => bytes)) buffer_mappings;

  event Write(string _identity);
  event Write(string _identity, uint8 _file);
  event Unlink(string _identity);

  constructor() public {
    owner = msg.sender;
  }
 
  modifier restricted() {
    if (msg.sender == owner) _;
  }

  function write(string identity, bytes ctBuffer, bytes csBuffer, 
    bytes mtBuffer, bytes msBuffer) public restricted {
    buffer_mappings[identity][0] = ctBuffer;
    buffer_mappings[identity][1] = csBuffer;
    buffer_mappings[identity][2] = mtBuffer;
    buffer_mappings[identity][3] = msBuffer;
    emit Write(identity);
  }

  function write(string identity, uint8 file, bytes buffer) public restricted {
    buffer_mappings[identity][file] = buffer;
    emit Write(identity, file);
  }

  function read(string identity) public view returns (bytes ctBuffer, bytes csBuffer,
    bytes mtBuffer, bytes msBuffer) {
    ctBuffer = buffer_mappings[identity][0];
    csBuffer = buffer_mappings[identity][1];
    mtBuffer = buffer_mappings[identity][2];
    msBuffer = buffer_mappings[identity][3];
    return (csBuffer, csBuffer, mtBuffer, msBuffer);
  }

  function read(string identity, uint8 file) public view returns (bytes buffer) {
    return buffer_mappings[identity][file];
  }

  function unlink(string identity) public restricted {
    for (uint8 i = 0; i < 4; i++) {
      delete buffer_mappings[identity][i];
    }
    emit Unlink(identity);
  }
}
