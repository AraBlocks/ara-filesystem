pragma solidity ^0.4.24;

contract Ownership {
	address public owner;
	mapping (string => Tree) content;

	event Published(string _identity);

	struct Tree {
		bytes root;
		bytes signature;
	}

	constructor() public {
		owner = msg.sender;
	}
 
 	modifier restricted() {
 		if (msg.sender == owner) _;
 	}

	function publish(string identity, bytes root, bytes signature) public restricted {
		content[identity] = Tree(root, signature);
		emit Published(identity);
	}

	function resolve(string identity) public view returns (bytes root, bytes signature) {
		return (content[identity].root, content[identity].signature);
	}
}
