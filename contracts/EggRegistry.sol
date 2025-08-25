// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EggRegistry {
    
    // Simple storage - just names and owners
    mapping(string => address) public nameToOwner;
    mapping(address => string[]) public ownerToNames;
    mapping(string => bool) public nameExists;
    
    // Events
    event NameRegistered(string indexed name, address indexed owner, bool isBridged);
    
    /**
     * @dev Register name locally (called by users on source chain)
     */
    function registerName(string memory name) external {
        require(bytes(name).length >= 3 && bytes(name).length <= 32, "Invalid name length");
        require(!nameExists[name], "Name already taken");
        require(_isValidName(name), "Invalid name format");
        
        // Register locally
        nameToOwner[name] = msg.sender;
        ownerToNames[msg.sender].push(name);
        nameExists[name] = true;
        
        emit NameRegistered(name, msg.sender, false);
    }
    
    /**
     * @dev Receive bridged name (called by bridge executor)
     */
    function receiveBridgedName(string memory name, address owner) external payable {
        require(bytes(name).length >= 3 && bytes(name).length <= 32, "Invalid name length");
        require(!nameExists[name], "Name already exists");
        
        // Register the bridged name
        nameToOwner[name] = owner;
        ownerToNames[owner].push(name);
        nameExists[name] = true;
        
        emit NameRegistered(name, owner, true);
    }
    
    /**
     * @dev Get all names owned by an address
     */
    function getOwnerNames(address owner) external view returns (string[] memory) {
        return ownerToNames[owner];
    }
    
    /**
     * @dev Check if name is available
     */
    function isNameAvailable(string memory name) external view returns (bool) {
        return !nameExists[name] && _isValidName(name);
    }
    
    /**
     * @dev Get name data for bridge script
     */
    function getNameData(string memory name) external view returns (
        address owner,
        bool exists
    ) {
        return (nameToOwner[name], nameExists[name]);
    }
    
    /**
     * @dev Validate name format (alphanumeric only)
     */
    function _isValidName(string memory name) internal pure returns (bool) {
        bytes memory nameBytes = bytes(name);
        if (nameBytes.length == 0) return false;
        
        for (uint i = 0; i < nameBytes.length; i++) {
            bytes1 char = nameBytes[i];
            bool isValid = (char >= 0x30 && char <= 0x39) || // 0-9
                          (char >= 0x61 && char <= 0x7A) || // a-z
                          (char >= 0x41 && char <= 0x5A);   // A-Z
            
            if (!isValid) return false;
        }
        
        return true;
    }
}
