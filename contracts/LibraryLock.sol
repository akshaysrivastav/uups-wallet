pragma solidity ^0.5.0;

// Inheritance
import { WalletStorage } from "./WalletStorage.sol";

contract LibraryLock is WalletStorage {
    // Ensures no one can manipulate the Logic Contract once it is deployed.

    modifier delegatedOnly() {
        require(
            initialized == true,
            "The library is locked. No direct 'call' is allowed."
        );
        _;
    }
    function _initialize() internal {
        initialized = true;
    }
}
