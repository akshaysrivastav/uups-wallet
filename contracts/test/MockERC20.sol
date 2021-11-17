pragma solidity ^0.5.12;

import "./ERC20.sol";

contract MockERC20 is ERC20 {
    constructor() public ERC20("Test Name", "Test Symbol") {}

    function allocateTo(address account, uint256 amount) public returns (bool) {
        _mint(account, amount);
        return true;
    }
}