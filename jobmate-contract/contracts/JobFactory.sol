// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./JobEscrow.sol";

contract JobFactory {
    address public platform;
    address public arbitrator;
    uint256 public platformFeePercent;
    
    mapping(string => address) public jobContracts; // jobId => escrow contract address
    address[] public allJobContracts;
    
    event JobCreated(
        string indexed jobId,
        address indexed escrowContract,
        address indexed client,
        string jobTitle
    );
    
    modifier onlyPlatform() {
        require(msg.sender == platform, "Only platform can call this");
        _;
    }
    
    constructor(address _arbitrator, uint256 _platformFeePercent) {
        require(_arbitrator != address(0), "Invalid arbitrator address");
        require(_platformFeePercent <= 100, "Fee percent too high");
        
        platform = msg.sender;
        arbitrator = _arbitrator;
        platformFeePercent = _platformFeePercent;
    }
    
    // Create a new job escrow contract
    function createJob(
        string memory _jobId,
        string memory _jobTitle
    ) external returns (address) {
        require(bytes(_jobId).length > 0, "Job ID cannot be empty");
        require(jobContracts[_jobId] == address(0), "Job already exists");
        
        // Create new escrow contract
        JobEscrow escrow = new JobEscrow(
            msg.sender, // client
            platform,
            arbitrator,
            platformFeePercent,
            _jobId,
            _jobTitle
        );
        
        address escrowAddress = address(escrow);
        jobContracts[_jobId] = escrowAddress;
        allJobContracts.push(escrowAddress);
        
        emit JobCreated(_jobId, escrowAddress, msg.sender, _jobTitle);
        
        return escrowAddress;
    }
    
    // Update platform fee (only platform owner)
    function updatePlatformFee(uint256 _newFeePercent) external onlyPlatform {
        require(_newFeePercent <= 100, "Fee percent too high");
        platformFeePercent = _newFeePercent;
    }
    
    // Update arbitrator (only platform owner)
    function updateArbitrator(address _newArbitrator) external onlyPlatform {
        require(_newArbitrator != address(0), "Invalid arbitrator address");
        arbitrator = _newArbitrator;
    }
    
    // Get escrow contract address by job ID
    function getJobContract(string memory _jobId) external view returns (address) {
        return jobContracts[_jobId];
    }
    
    // Get total number of jobs created
    function getTotalJobs() external view returns (uint256) {
        return allJobContracts.length;
    }
    
    // Get all job contracts (paginated)
    function getJobContracts(uint256 _start, uint256 _limit) 
        external 
        view 
        returns (address[] memory) 
    {
        require(_start < allJobContracts.length, "Start index out of bounds");
        
        uint256 end = _start + _limit;
        if (end > allJobContracts.length) {
            end = allJobContracts.length;
        }
        
        uint256 size = end - _start;
        address[] memory contracts = new address[](size);
        
        for (uint256 i = 0; i < size; i++) {
            contracts[i] = allJobContracts[_start + i];
        }
        
        return contracts;
    }
}
