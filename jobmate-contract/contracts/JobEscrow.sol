// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract JobEscrow {
    enum JobStatus { CREATED, FUNDED, IN_PROGRESS, SUBMITTED, COMPLETED, DISPUTED, REFUNDED }
    
    address public client;
    address public freelancer;
    address public platform;
    uint256 public amount;
    uint256 public platformFee;
    uint256 public freelancerAmount;
    JobStatus public status;
    uint256 public workSubmittedAt;
    uint256 public disputeTimeout = 7 days;
    uint256 public approvalTimeout = 1 minutes; // Thời gian chờ phê duyệt công việc, điều chỉnh từ 3 ngày thành 1 phút để thuận tiện cho việc kiểm thử
    address public arbitrator;
    
    string public jobId;
    string public jobTitle;
    
    event JobFunded(address indexed client, uint256 amount);
    event FreelancerAssigned(address indexed freelancer);
    event WorkSubmitted(address indexed freelancer, uint256 timestamp);
    event WorkApproved(address indexed client);
    event PaymentReleased(address indexed freelancer, uint256 amount, address indexed platform, uint256 fee);
    event DisputeInitiated(address indexed initiator, uint256 timestamp);
    event DisputeResolved(address indexed resolver, bool favorFreelancer);
    event Refunded(address indexed client, uint256 amount);
    
    modifier onlyClient() {
        require(msg.sender == client, "Only client can call this");
        _;
    }
    
    modifier onlyFreelancer() {
        require(msg.sender == freelancer, "Only freelancer can call this");
        _;
    }
    
    modifier onlyArbitrator() {
        require(msg.sender == arbitrator, "Only arbitrator can call this");
        _;
    }
    
    modifier inStatus(JobStatus _status) {
        require(status == _status, "Invalid status for this operation");
        _;
    }
    
    constructor(
        address _client,
        address _platform,
        address _arbitrator,
        uint256 _platformFeePercent,
        string memory _jobId,
        string memory _jobTitle
    ) {
        require(_client != address(0), "Invalid client address");
        require(_platform != address(0), "Invalid platform address");
        require(_arbitrator != address(0), "Invalid arbitrator address");
        require(_platformFeePercent <= 100, "Fee percent too high");
        
        client = _client;
        platform = _platform;
        arbitrator = _arbitrator;
        jobId = _jobId;
        jobTitle = _jobTitle;
        status = JobStatus.CREATED;
    }
    
    // Step 1: Client funds the escrow
    function fundEscrow(uint256 _platformFeePercent) external payable onlyClient inStatus(JobStatus.CREATED) {
        require(msg.value > 0, "Amount must be greater than 0");
        
        amount = msg.value;
        platformFee = (amount * _platformFeePercent) / 100;
        freelancerAmount = amount - platformFee;
        status = JobStatus.FUNDED;
        
        emit JobFunded(client, amount);
    }
    
    // Step 2: Client assigns freelancer to the job
    function assignFreelancer(address _freelancer) external onlyClient inStatus(JobStatus.FUNDED) {
        require(_freelancer != address(0), "Invalid freelancer address");
        require(_freelancer != client, "Client cannot be freelancer");
        
        freelancer = _freelancer;
        status = JobStatus.IN_PROGRESS;
        
        emit FreelancerAssigned(freelancer);
    }
    
    // Step 3: Freelancer submits work
    function submitWork() external onlyFreelancer inStatus(JobStatus.IN_PROGRESS) {
        workSubmittedAt = block.timestamp;
        status = JobStatus.SUBMITTED;
        
        emit WorkSubmitted(freelancer, workSubmittedAt);
    }
    
    // Step 4: Client approves work and automatic payout
    function approveWork() external onlyClient inStatus(JobStatus.SUBMITTED) {
        status = JobStatus.COMPLETED;
        
        emit WorkApproved(client);
        
        // Automatic payout
        _releaseFunds();
    }
    
    // Internal function to release funds
    function _releaseFunds() private {
        // Transfer to freelancer
        (bool sentToFreelancer, ) = freelancer.call{value: freelancerAmount}("");
        require(sentToFreelancer, "Failed to send to freelancer");
        
        // Transfer platform fee
        (bool sentToPlatform, ) = platform.call{value: platformFee}("");
        require(sentToPlatform, "Failed to send to platform");
        
        emit PaymentReleased(freelancer, freelancerAmount, platform, platformFee);
    }
    
    // Dispute Resolution: Freelancer initiates dispute if client doesn't respond
    function initiateDispute() external onlyFreelancer inStatus(JobStatus.SUBMITTED) {
        require(block.timestamp >= workSubmittedAt + approvalTimeout, "Approval timeout not reached");
        
        status = JobStatus.DISPUTED;
        
        emit DisputeInitiated(freelancer, block.timestamp);
    }
    
    // Arbitrator releases funds to freelancer
    function releaseFundsToFreelancer() external onlyArbitrator inStatus(JobStatus.DISPUTED) {
        status = JobStatus.COMPLETED;
        
        emit DisputeResolved(arbitrator, true);
        
        _releaseFunds();
    }
    
    // Arbitrator refunds to client
    function refundToClient() external onlyArbitrator inStatus(JobStatus.DISPUTED) {
        status = JobStatus.REFUNDED;
        
        emit DisputeResolved(arbitrator, false);
        
        (bool sent, ) = client.call{value: amount}("");
        require(sent, "Failed to refund to client");
        
        emit Refunded(client, amount);
    }
    
    // Client can cancel and get refund if freelancer not assigned yet
    function cancelAndRefund() external onlyClient inStatus(JobStatus.FUNDED) {
        status = JobStatus.REFUNDED;
        
        (bool sent, ) = client.call{value: amount}("");
        require(sent, "Failed to refund to client");
        
        emit Refunded(client, amount);
    }
    
    // View functions
    function getJobDetails() external view returns (
        address _client,
        address _freelancer,
        uint256 _amount,
        uint256 _platformFee,
        uint256 _freelancerAmount,
        JobStatus _status,
        string memory _jobId,
        string memory _jobTitle
    ) {
        return (
            client,
            freelancer,
            amount,
            platformFee,
            freelancerAmount,
            status,
            jobId,
            jobTitle
        );
    }
    
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
