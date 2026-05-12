// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CampusGigEscrow + Reputation
 * @notice Stub contract for the CampusGig protocol.
 *
 *  - Buyers deposit native currency into escrow when hiring a gig.
 *  - Escrow is released to the seller on buyer confirmation, or refunded after a deadline.
 *  - Each completed gig mints a non-transferable reputation token (CGREP) to the seller,
 *    tagged with the gig's skill category. Transfers are blocked via _beforeTokenTransfer.
 *
 *  This file is provided as a starting point. Deploy via Foundry/Hardhat off-platform.
 */

interface IERC20Metadata {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}

contract CampusGigEscrow {
    enum Status { None, Funded, Released, Refunded, Disputed }

    struct Gig {
        address buyer;
        address seller;
        uint256 amount;
        uint64  deadline;
        bytes32 skillCategory;
        Status  status;
    }

    address public admin;
    uint256 public nextGigId;
    mapping(uint256 => Gig) public gigs;

    // Reputation: per-seller, per-skillCategory work count (soulbound counter)
    mapping(address => mapping(bytes32 => uint256)) public workCount;

    event GigFunded(uint256 indexed gigId, address indexed buyer, address indexed seller, uint256 amount, bytes32 skillCategory);
    event GigReleased(uint256 indexed gigId);
    event GigRefunded(uint256 indexed gigId);
    event GigDisputed(uint256 indexed gigId);
    event ReputationMinted(address indexed seller, bytes32 indexed skillCategory, uint256 newCount);

    modifier onlyAdmin() { require(msg.sender == admin, "not admin"); _; }

    constructor() { admin = msg.sender; }

    /// @notice Buyer funds an escrow for a gig.
    function fund(address seller, uint64 deadline, bytes32 skillCategory)
        external
        payable
        returns (uint256 gigId)
    {
        require(seller != address(0) && seller != msg.sender, "bad seller");
        require(msg.value > 0, "no funds");
        require(deadline > block.timestamp, "bad deadline");

        gigId = ++nextGigId;
        gigs[gigId] = Gig({
            buyer: msg.sender,
            seller: seller,
            amount: msg.value,
            deadline: deadline,
            skillCategory: skillCategory,
            status: Status.Funded
        });
        emit GigFunded(gigId, msg.sender, seller, msg.value, skillCategory);
    }

    /// @notice Buyer confirms delivery → release funds and mint reputation.
    function release(uint256 gigId) external {
        Gig storage g = gigs[gigId];
        require(g.status == Status.Funded, "not funded");
        require(msg.sender == g.buyer, "only buyer");

        g.status = Status.Released;
        (bool ok,) = g.seller.call{value: g.amount}("");
        require(ok, "transfer failed");

        uint256 newCount = ++workCount[g.seller][g.skillCategory];
        emit ReputationMinted(g.seller, g.skillCategory, newCount);
        emit GigReleased(gigId);
    }

    /// @notice After deadline, buyer can pull funds back.
    function refund(uint256 gigId) external {
        Gig storage g = gigs[gigId];
        require(g.status == Status.Funded, "not funded");
        require(block.timestamp >= g.deadline, "not yet");
        require(msg.sender == g.buyer, "only buyer");

        g.status = Status.Refunded;
        (bool ok,) = g.buyer.call{value: g.amount}("");
        require(ok, "refund failed");
        emit GigRefunded(gigId);
    }

    /// @notice Either party can flag a dispute; admin resolves off-chain stub.
    function dispute(uint256 gigId) external {
        Gig storage g = gigs[gigId];
        require(g.status == Status.Funded, "not funded");
        require(msg.sender == g.buyer || msg.sender == g.seller, "not party");
        g.status = Status.Disputed;
        emit GigDisputed(gigId);
    }
}

/**
 * @title CGREP — soulbound reputation token (sketch).
 * @notice Minimal ERC-20-like interface that BLOCKS all transfers via _beforeTokenTransfer.
 *         Use as a signal of completed work; cannot be sold or moved between wallets.
 */
contract CampusGigReputation is IERC20Metadata {
    string public constant name = "CampusGig Reputation";
    string public constant symbol = "CGREP";
    uint8  public constant decimals = 0;

    address public minter; // CampusGigEscrow address
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor(address _minter) { minter = _minter; }

    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, "not minter");
        _beforeTokenTransfer(address(0), to, amount);
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    /// @dev Soulbound: block every non-mint, non-burn transfer.
    function _beforeTokenTransfer(address from, address to, uint256 /*amount*/) internal pure {
        require(from == address(0) || to == address(0), "CGREP: non-transferable");
    }

    // Disabled standard ERC-20 mutators
    function transfer(address, uint256) external pure returns (bool) {
        revert("CGREP: non-transferable");
    }
    function transferFrom(address, address, uint256) external pure returns (bool) {
        revert("CGREP: non-transferable");
    }
    function approve(address, uint256) external pure returns (bool) {
        revert("CGREP: non-transferable");
    }
    function allowance(address, address) external pure returns (uint256) { return 0; }
}
