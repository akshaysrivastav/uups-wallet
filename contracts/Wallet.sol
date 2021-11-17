pragma solidity ^0.5.12;

import { IERC20 } from "./IERC20.sol";
import { SafeERC20 } from "./SafeERC20.sol";

// Inheritance
import { LibraryLock } from "./LibraryLock.sol";
import { Proxiable } from "./Proxiable.sol";
import { Ownable } from "./Ownable.sol";
import { WalletStorage } from "./WalletStorage.sol";

contract Wallet is WalletStorage, Ownable, Proxiable, LibraryLock {
    using SafeERC20 for IERC20;

    event CodeUpdated(address indexed newCode);

    function initialize() public {
        require(!initialized, "The library has already been initialized.");
        LibraryLock._initialize();
        setOwner(msg.sender);
    }

    /// @dev Update the masterchef logic contract code
    function updateCode(address newCode) external onlyOwner delegatedOnly {
        updateCodeAddress(newCode);
        emit CodeUpdated(newCode);
    }

    function() external payable {}

    function pullTokens(IERC20 token, uint amount) external onlyOwner {
        if (amount == 0) {
            token.safeTransfer(owner(), token.balanceOf(address(this)));
        } else {
            token.safeTransfer(owner(), amount);
        }
    }

    function pullEth(uint amount) external onlyOwner {
        if (amount == 0) {
            address(uint160(owner())).transfer(address(this).balance);
        } else {
            address(uint160(owner())).transfer(amount);
        }
    }
}
