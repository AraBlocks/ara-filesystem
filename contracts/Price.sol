pragma solidity ^0.4.24;

contract Storage {

  function exists(string identity) public view returns (bool doesExist) { }

}

contract Price {

  event PriceSet(string _identity);

  mapping (string => uint16) price_mappings;
  Storage s;

  modifier onlyBy(address _account) {
    require(msg.sender == _account, "Sender not authorized.");
    _;
  }

  function setPrice(string identity, uint16 price, address storageAddr) public onlyBy(msg.sender) {
    s = Storage(storageAddr);
    require(s.exists(identity));
    price_mappings[identity] = price;  
    emit PriceSet(identity);
  }

  function getPrice(string identity) public view returns (uint16 price) {
    return price_mappings[identity];
  }

}
