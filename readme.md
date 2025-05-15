# 🛡️ Reentrancy PoC - LegionPreLiquidSaleV1

## 🚨 Vulnerability Summary

This project demonstrates a **reentrancy vulnerability** in the `LegionPreLiquidSaleV1` contract's `claimAskTokenAllocation` function, triggered via a **malicious vesting factory**.

The vulnerability exists because the `_createVesting()` function is called before critical state variables (like `position.hasSettled`) are updated, allowing malicious contracts to reenter the same function and bypass state protections.

---

## 🧪 Proof-of-Concept

The PoC test (`test/ReentrancyPoC.test.js`) simulates an attacker calling `claimAskTokenAllocation` via a malicious vesting factory, triggering a reentrancy scenario.

### PoC Steps:
1. Deploy mock ERC20 token.
2. Deploy `LegionPreLiquidSaleV1`.
3. Deploy `MaliciousVestingFactory`, passing the sale contract address.
4. Configure the sale contract using the `setTestConfig()` helper.
5. Simulate an investment by the attacker.
6. Call `claimAskTokenAllocation()` — which reenters during `_createVesting()`.

---

## 🔍 Vulnerable Code

File: [`contracts/LegionPreLiquidSaleV1.sol`](contracts/LegionPreLiquidSaleV1.sol)

```solidity
address payable vestingAddress = _createVesting(
    msg.sender,
    uint64(vestingConfig.vestingStartTime),
    uint64(vestingConfig.vestingDurationSeconds),
    uint64(vestingConfig.vestingCliffDurationSeconds)
);
````

```solidity
SafeTransferLib.safeTransfer(saleStatus.askToken, vestingAddress, amountToBeVested);
```

---

## 📁 Project Structure

```
contracts/
  ├── LegionPreLiquidSaleV1.sol        # Vulnerable contract
  ├── MaliciousVestingFactory.sol      # Reentrancy vector
  └── MockERC20.sol                    # Mock token used for PoC

test/
  └── ReentrancyPoC.test.js            # The PoC test script
```

---

## 🔧 Run Locally

Make sure you have Node.js and Hardhat installed.

```bash
npm install
npx hardhat compile
npx hardhat test test/ReentrancyPoC.test.js
```

Expected Output:

```
PoC: Reentrancy in claimAskTokenAllocation
  ✔ should trigger reentrancy via malicious vesting factory
```

---

## 🧠 Root Cause Summary

The contract fails to perform state updates **before external calls**, violating the Checks-Effects-Interactions pattern. A malicious vesting factory can exploit this to reenter `claimAskTokenAllocation()`.

---

## 💡 Suggested Fix

Move `position.hasSettled = true;` and `usedSignatures[...] = true;` **before** `_createVesting()` is called.

---

