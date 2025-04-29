// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Votes.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

/**
 * @title MonadNFT
 * @dev ERC721 NFT collection optimized for Monad blockchain
 */
contract MonadNFT is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Burnable, Ownable, EIP712, ERC721Votes, ERC2981 {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    uint256 public immutable maxSupply;
    uint256 public mintPrice;
    string private _baseTokenURI;
    bool public mintingEnabled = true;
    mapping(address => bool) public minters;

    // Events
    event MintingToggled(bool enabled);
    event MintPriceChanged(uint256 newPrice);
    event MinterStatusChanged(address minter, bool status);
    event BatchMinted(address to, uint256 count, uint256 firstTokenId);

    /**
     * @dev Constructor to set up the NFT collection
     * @param name_ Collection name
     * @param symbol_ Collection symbol
     * @param baseURI_ Base URI for token metadata
     * @param maxSupply_ Maximum supply of NFTs
     * @param mintPrice_ Price to mint one NFT
     * @param royaltyFee_ Royalty fee in basis points (e.g., 250 = 2.5%)
     * @param royaltyRecipient_ Address to receive royalties
     */
    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        uint256 maxSupply_,
        uint256 mintPrice_,
        uint96 royaltyFee_,
        address royaltyRecipient_
    ) ERC721(name_, symbol_) EIP712(name_, "1") Ownable(msg.sender) {
        _baseTokenURI = baseURI_;
        maxSupply = maxSupply_;
        mintPrice = mintPrice_;
        minters[msg.sender] = true;
        
        // Set default royalty
        _setDefaultRoyalty(royaltyRecipient_, royaltyFee_);
    }

    /**
     * @dev Set the base URI for all token IDs
     * @param baseURI_ New base URI
     */
    function setBaseURI(string memory baseURI_) public onlyOwner {
        _baseTokenURI = baseURI_;
    }

    /**
     * @dev Set the mint price
     * @param newPrice New mint price
     */
    function setMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
        emit MintPriceChanged(newPrice);
    }

    /**
     * @dev Enable or disable public minting
     * @param enabled Whether minting should be enabled
     */
    function toggleMinting(bool enabled) public onlyOwner {
        mintingEnabled = enabled;
        emit MintingToggled(enabled);
    }

    /**
     * @dev Add or remove an address from the minters list
     * @param minter Address to update
     * @param status Whether the address can mint
     */
    function setMinter(address minter, bool status) public onlyOwner {
        minters[minter] = status;
        emit MinterStatusChanged(minter, status);
    }

    /**
     * @dev Public mint function - costs mintPrice
     */
    function mint() public payable returns (uint256) {
        require(mintingEnabled, "Minting is disabled");
        require(msg.value >= mintPrice, "Insufficient payment");
        require(totalSupply() < maxSupply, "Max supply reached");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);

        return tokenId;
    }

    /**
     * @dev Mint a token with a specific URI (minters only)
     * @param to Recipient address
     * @param uri Token URI
     */
    function mintWithURI(address to, string memory uri) public returns (uint256) {
        require(minters[msg.sender], "Not authorized to mint");
        require(totalSupply() < maxSupply, "Max supply reached");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        return tokenId;
    }

    /**
     * @dev Batch mint multiple tokens (minters only)
     * Optimized for Monad's parallel execution
     * @param to Recipient address
     * @param count Number of tokens to mint
     */
    function batchMint(address to, uint256 count) public returns (uint256) {
        require(minters[msg.sender], "Not authorized to mint");
        require(totalSupply() + count <= maxSupply, "Would exceed max supply");

        uint256 firstTokenId = _tokenIdCounter.current();
        
        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            _safeMint(to, tokenId);
        }

        emit BatchMinted(to, count, firstTokenId);
        return firstTokenId;
    }

    /**
     * @dev Withdraw contract balance to owner
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }

    // Override functions
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable, ERC721Votes)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable, ERC721Votes)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}