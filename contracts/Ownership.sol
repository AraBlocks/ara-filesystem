pragma solidity ^0.4.0;

contract Ownership {
	address public owner;
	mapping (bytes => Tree) content;

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
	}

	function getTree(bytes identity) public constant returns (bytes, bytes) {
		return (content[identity].root, content[identity].signature);
	}
}