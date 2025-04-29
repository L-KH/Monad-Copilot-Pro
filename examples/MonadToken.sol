// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title MonadToken
 * @dev ERC20 token for the Monad ecosystem with minting and burning capabilities.
 *      Optimized for Monad's parallel execution model.
 */
contract MonadToken is ERC20, ERC20Burnable, Ownable, ERC20Permit {
    uint8 private _decimals;
    uint256 public maxSupply;
    bool public transfersEnabled = true;
    
    // Events for Monad-specific functionality
    event TransfersToggled(bool enabled);
    event MaxSupplyChanged(uint256 newMaxSupply);
    
    /**
     * @dev Constructor to create the token with initial parameters
     * @param name_ Token name
     * @param symbol_ Token symbol
     * @param decimals_ Number of decimals for token amounts
     * @param initialSupply_ Initial supply to mint to the owner (scaled by 10^decimals)
     * @param maxSupply_ Maximum possible supply (scaled by 10^decimals)
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply_,
        uint256 maxSupply_
    ) ERC20(name_, symbol_) Ownable(msg.sender) ERC20Permit(name_) {
        require(initialSupply_ <= maxSupply_, "Initial supply cannot exceed max supply");
        
        _decimals = decimals_;
        maxSupply = maxSupply_;
        
        // Mint initial supply to owner
        _mint(msg.sender, initialSupply_);
    }
    
    /**
     * @dev Override decimals function to use custom decimals
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Mint new tokens (owner only)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= maxSupply, "Exceeds maximum supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Update maximum supply (owner only)
     * @param newMaxSupply New maximum supply
     */
    function setMaxSupply(uint256 newMaxSupply) public onlyOwner {
        require(newMaxSupply >= totalSupply(), "New max supply below current total supply");
        maxSupply = newMaxSupply;
        emit MaxSupplyChanged(newMaxSupply);
    }
    
    /**
     * @dev Enable or disable transfers (owner only)
     * @param enabled Whether transfers should be enabled
     */
    function toggleTransfers(bool enabled) public onlyOwner {
        transfersEnabled = enabled;
        emit TransfersToggled(enabled);
    }
    
    /**
     * @dev Override transfer function to check if transfers are enabled
     */
    function _update(address from, address to, uint256 value) internal virtual override {
        if (from != address(0) && to != address(0)) {
            // Regular transfer (not minting or burning)
            require(transfersEnabled, "Transfers are currently disabled");
        }
        super._update(from, to, value);
    }
    
    /**
     * @dev Monad-optimized batch transfer function to leverage parallel execution
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to transfer to each recipient
     */
    function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) public returns (bool) {
        require(recipients.length == amounts.length, "Recipients and amounts arrays must have the same length");
        require(transfersEnabled, "Transfers are currently disabled");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(balanceOf(msg.sender) >= totalAmount, "Insufficient balance for batch transfer");
        
        // Perform transfers
        for (uint256 i = 0; i < recipients.length; i++) {
            _transfer(msg.sender, recipients[i], amounts[i]);
        }
        
        return true;
    }
}