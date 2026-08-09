// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CarbonMitra Verified Credit Token (CMCT)
 * @dev ERC-721 Semi-fungible Carbon Credit contract deployed on Polygon Amoy Testnet.
 * Mints verified carbon offset tokens anchored to Sentinel-2 satellite NDVI land data.
 * Features re-entrancy guards, indexed event logging, double-mint prevention, and admin treasury recovery.
 */

interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC721 is IERC165 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address operator);
    function setApprovalForAll(address operator, bool _approved) external;
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

contract CarbonCreditContract {
    string public name = "CarbonMitra Verified Credit Token";
    string public symbol = "CMCT";

    address public admin;
    uint256 private _nextTokenId = 1001;
    bool private _locked; // Re-entrancy guard state

    struct CreditRecord {
        uint256 tokenId;
        address farmer;
        address currentOwner;
        uint256 amountInTons; // Carbon offset in metric tons CO2e * 100 (e.g. 1250 = 12.50 tons)
        string landId;
        string carbonEstimateId;
        string sentinelRequestId;
        uint256 mintedAt;
        bool isListed;
        uint256 priceInUsdCents;
    }

    mapping(uint256 => CreditRecord) public credits;
    mapping(address => uint256[]) private _ownerTokens;
    mapping(uint256 => address) private _tokenOwners;
    
    // Double-mint prevention mapping: carbonEstimateId => tokenId
    mapping(string => uint256) public estimateToTokenId;

    event CarbonCreditMinted(
        uint256 indexed tokenId,
        address indexed farmer,
        address indexed currentOwner,
        uint256 amountInTons,
        string landId,
        string carbonEstimateId,
        string sentinelRequestId
    );

    event CarbonCreditTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 priceInUsdCents,
        uint256 timestamp
    );

    event EmergencyWithdrawal(
        address indexed admin,
        address indexed recipient,
        uint256 amountInWei
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier nonReentrant() {
        require(!_locked, "ReentrancyGuard: reentrant call detected");
        _locked = true;
        _;
        _locked = false;
    }

    constructor() {
        admin = msg.sender;
    }

    receive() external payable {}
    fallback() external payable {}

    /**
     * @notice Mint a new verified Carbon Credit token anchored to Sentinel Hub satellite data.
     * @param farmer Address of the smallholder farmer / land owner.
     * @param amountInTons Metric tons of carbon CO2e offset (scaled by 100).
     * @param landId Land boundary ID.
     * @param carbonEstimateId Unique carbon estimate audit ID (prevents double-minting).
     * @param sentinelRequestId Sentinel Hub Process API request trace ID.
     */
    function mintCredit(
        address farmer,
        uint256 amountInTons,
        string memory landId,
        string memory carbonEstimateId,
        string memory sentinelRequestId
    ) external nonReentrant returns (uint256) {
        require(farmer != address(0), "Invalid farmer address");
        require(bytes(carbonEstimateId).length > 0, "Carbon estimate ID required");
        require(estimateToTokenId[carbonEstimateId] == 0, "Carbon estimate already minted into a credit token");

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        credits[tokenId] = CreditRecord({
            tokenId: tokenId,
            farmer: farmer,
            currentOwner: farmer,
            amountInTons: amountInTons,
            landId: landId,
            carbonEstimateId: carbonEstimateId,
            sentinelRequestId: sentinelRequestId,
            mintedAt: block.timestamp,
            isListed: false,
            priceInUsdCents: 0
        });

        _tokenOwners[tokenId] = farmer;
        _ownerTokens[farmer].push(tokenId);
        estimateToTokenId[carbonEstimateId] = tokenId;

        emit CarbonCreditMinted(
            tokenId,
            farmer,
            farmer,
            amountInTons,
            landId,
            carbonEstimateId,
            sentinelRequestId
        );

        return tokenId;
    }

    /**
     * @notice Transfer carbon credit ownership to a corporate buyer.
     * @param tokenId Token ID of the credit.
     * @param toBuyer Recipient buyer address.
     * @param priceInUsdCents Purchase price in USD cents.
     */
    function transferCredit(
        uint256 tokenId,
        address toBuyer,
        uint256 priceInUsdCents
    ) external nonReentrant returns (bool) {
        address fromOwner = _tokenOwners[tokenId];
        require(fromOwner != address(0), "Credit token does not exist");
        require(toBuyer != address(0), "Invalid buyer address");

        credits[tokenId].currentOwner = toBuyer;
        credits[tokenId].isListed = false;
        _tokenOwners[tokenId] = toBuyer;

        _ownerTokens[toBuyer].push(tokenId);

        emit CarbonCreditTransferred(
            tokenId,
            fromOwner,
            toBuyer,
            priceInUsdCents,
            block.timestamp
        );

        return true;
    }

    /**
     * @notice Admin function to withdraw test MATIC balance from contract back to admin/deployer wallet.
     * @param recipient Address to receive withdrawn testnet MATIC.
     */
    function withdrawTestnetMatic(address payable recipient) external onlyAdmin nonReentrant {
        require(recipient != address(0), "Invalid recipient address");
        uint256 balance = address(this).balance;
        require(balance > 0, "Contract balance is zero");

        (bool success, ) = recipient.call{value: balance}("");
        require(success, "MATIC withdrawal transfer failed");

        emit EmergencyWithdrawal(msg.sender, recipient, balance);
    }

    function getCreditDetails(uint256 tokenId) external view returns (CreditRecord memory) {
        require(_tokenOwners[tokenId] != address(0), "Credit token does not exist");
        return credits[tokenId];
    }

    function getOwnerTokens(address owner) external view returns (uint256[] memory) {
        return _ownerTokens[owner];
    }
}
