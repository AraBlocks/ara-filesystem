pragma solidity ^0.4.0;

contract Ownership {
	address public owner;
	mapping (bytes => Tree) content;

	event Published(bytes identity);

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

	function publish(bytes identity, bytes root, bytes signature) public restricted {
		content[identity] = Tree(root, signature);
		emit Published(identity);
	}

	function resolve(bytes identity) public constant returns (bytes, bytes) {
		return (content[identity].root, content[identity].signature);
	}
}