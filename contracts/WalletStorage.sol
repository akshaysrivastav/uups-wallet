pragma solidity ^0.5.12;

contract WalletStorage {
    /** WARNING: NEVER RE-ORDER VARIABLES!
     *  Always double-check that new variables are added APPEND-ONLY.
     *  Re-ordering variables can permanently BREAK the deployed proxy contract.
     */
    address public _owner;
    bool public initialized;
}
