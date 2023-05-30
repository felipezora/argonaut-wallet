// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IToken {
    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function decimals() external pure returns (uint8);

    function balanceOf(address account) external view returns (uint256);

    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);

    function transferFrom(address from, address to, uint256 amount) external;

    function increaseAllowance(address to, uint256 amount) external;

    function decreaseAllowance(address to, uint256 amount) external;
}

struct TokenInfo {
    string name;
    string symbol;
    uint8 decimals;
}

contract Wallet {
    address public owner;
    IToken[] public validTokenInstances;

    constructor(address firstTokAddr) {
        owner = msg.sender;
        validTokenInstances.push(IToken(firstTokAddr));
    }

    modifier _onlyOwner() {
        require(owner == msg.sender, "Not owner");
        _;
    }

    modifier _validIndex(uint256 index) {
        require(index < validTokenInstances.length, "Invalid index");
        _;
    }

    function queryToken(
        uint256 tokenIndex
    ) external view _validIndex(tokenIndex) returns (TokenInfo memory) {
        TokenInfo memory token;
        token.name = validTokenInstances[tokenIndex].name();
        token.symbol = validTokenInstances[tokenIndex].symbol();
        token.decimals = validTokenInstances[tokenIndex].decimals();
        return token;
    }

    function registerToken(
        address tokenAddr
    ) external _onlyOwner returns (uint256) {
        validTokenInstances.push(IToken(tokenAddr));
        return validTokenInstances.length - 1;
    }

    function getBalance(
        uint256 tokenIndex
    ) external view _validIndex(tokenIndex) returns (uint256) {
        return validTokenInstances[tokenIndex].balanceOf(msg.sender);
    }

    function transfer(
        address to,
        uint256 amount,
        uint256 tokenIndex
    ) external _validIndex(tokenIndex) {
        IToken tokenInstance = validTokenInstances[tokenIndex];
        uint256 walletAllowance = tokenInstance.allowance(
            msg.sender,
            address(this)
        );
        require(walletAllowance >= amount, "Insufficient allowance");
        tokenInstance.transferFrom(msg.sender, to, amount);
    }
}
