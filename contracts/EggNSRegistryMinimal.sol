// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;    // ←  downgrade to 0.8.19

/**
 * @title EggNSRegistryMinimal
 * @dev Minimal zkEVM-compatible name registry (no OpenZeppelin deps).
 */
contract EggNSRegistryMinimal {
    struct NameRecord {
        address owner;
        address resolvedAddress;
        uint256 expirationTime;
        bool    isActive;
    }

    mapping(string => NameRecord) public names;
    address public owner;

    event NameRegistered(string indexed name, address indexed owner);
    event NameBridged   (string indexed name, address indexed owner);

    modifier onlyOwner()          { require(msg.sender == owner, "Not owner"); _; }
    modifier validName(string memory name) {
        require(bytes(name).length >= 3,  "Name too short");
        require(bytes(name).length <= 50, "Name too long");
        _;
    }

    constructor() { owner = msg.sender; }

    /*────────── user-callable functions ──────────*/

    function registerName(string memory name, address resolvedAddress)
        external validName(name)
    {
        require(resolvedAddress != address(0), "Invalid address");
        require(names[name].owner == address(0), "Name taken");

        names[name] = NameRecord({
            owner:           msg.sender,
            resolvedAddress: resolvedAddress,
            expirationTime:  block.timestamp + 365 days,
            isActive:        true
        });

        emit NameRegistered(name, msg.sender);
    }

    function createBridgedName(
        string  memory name,
        address         nameOwner,
        address         resolvedAddress
    )
        external validName(name)
    {
        require(nameOwner     != address(0), "Invalid owner");
        require(resolvedAddress != address(0), "Invalid address");
        require(names[name].owner == address(0), "Name taken");

        names[name] = NameRecord({
            owner:           nameOwner,
            resolvedAddress: resolvedAddress,
            expirationTime:  block.timestamp + 365 days,
            isActive:        true
        });

        emit NameBridged(name, nameOwner);
    }

    /*────────── view helpers ──────────*/

    function getNameOwner (string memory name) external view returns (address) { return names[name].owner; }

    function isNameActive (string memory name) external view returns (bool) {
        NameRecord memory r = names[name];
        return r.isActive && r.owner != address(0) && block.timestamp < r.expirationTime;
    }

    function resolveName  (string memory name) external view returns (address) {
        NameRecord memory r = names[name];
        return (r.isActive && block.timestamp < r.expirationTime) ? r.resolvedAddress : address(0);
    }
}
