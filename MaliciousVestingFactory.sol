// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface ISale {
    function claimAskTokenAllocation(uint256,uint256,bytes32,bytes calldata) external;
}

contract MaliciousVestingFactory {
    address public sale;

    constructor(address _sale) {
        sale = _sale;
    }

    function createLinearVesting(address, uint64, uint64, uint64) external returns (address) {
        ISale(sale).claimAskTokenAllocation(1 ether, 1000 ether, bytes32(0), "");
        return address(this);
    }
}

