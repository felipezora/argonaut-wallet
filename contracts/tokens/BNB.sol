// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BNBToken {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    string private _name;
    string private _symbol;

    constructor(string memory name_, string memory symbol_) {
        _balances[msg.sender] += 100000000000000000000; // 100 BNBToken
        _name = name_;
        _symbol = symbol_;
    }

    modifier _notFromZeroAddr(address from) {
        require(from != address(0), "Transfer from the zero address");
        _;
    }

    modifier _notToZeroAddr(address to) {
        require(to != address(0), "Transfer to the zero address");
        _;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public pure returns (uint8) {
        return 18;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function allowance(
        address owner,
        address spender
    ) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    function transfer(address to, uint256 amount) external _notToZeroAddr(to) {
        uint256 fromBalance = _balances[msg.sender];
        require(fromBalance >= amount, "Transfer amount exceeds balance");

        unchecked {
            _balances[msg.sender] -= amount;
        }
        _balances[to] += amount;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external _notToZeroAddr(to) _notFromZeroAddr(from) {
        require(
            _allowances[from][msg.sender] >= amount,
            "Insufficient allowance"
        );
        require(_balances[from] >= amount, "Insufficient balance");

        unchecked {
            _allowances[from][msg.sender] -= amount;
            _balances[from] -= amount;
        }
        _balances[to] += amount;
    }

    function increaseAllowance(
        address to,
        uint256 amount
    ) external _notToZeroAddr(to) {
        _allowances[msg.sender][to] += amount;
    }

    function decreaseAllowance(
        address to,
        uint256 amount
    ) external _notToZeroAddr(to) {
        uint256 currentAllowance = _allowances[msg.sender][to];
        require(currentAllowance >= amount, "Decreased allowance below zero");
        unchecked {
            _allowances[msg.sender][to] -= amount;
        }
    }
}
