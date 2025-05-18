Absolutely — here’s your polished `README.md` file for the `legion-reentrancy-poc` repo, enhanced with badges, tech stack, and a professional structure.

---

````markdown
# 🛡️ Reentrancy PoC – LegionPreLiquidSaleV1

![Status](https://img.shields.io/badge/status-PoC-success-green)
![Security](https://img.shields.io/badge/vulnerability-Reentrancy-critical-red)
![Tech](https://img.shields.io/badge/stack-Solidity%20%7C%20Hardhat-blue)

This repository contains a working **Proof of Concept (PoC)** for a **critical reentrancy vulnerability** found in the `LegionPreLiquidSaleV1` smart contract during a Code4rena audit.

---

## 🚨 Vulnerability Summary

This project demonstrates a **reentrancy vulnerability** in the `claimAskTokenAllocation` function, triggered via a **malicious vesting factory**.

The vulnerability exists because the `_createVesting()` function is called before critical state variables like `position.hasSettled` are updated. This allows malicious contracts to reenter the same function and bypass expected state checks.

---

## 🔬 PoC Overview

The PoC test (`test/ReentrancyPoC.test.js`) simulates an attacker calling `claimAskTokenAllocation` via a malicious factory contract, triggering the vulnerability.

### 🧪 Exploit Steps

1. Deploy mock ERC20 token.
2. Deploy vulnerable `LegionPreLiquidSaleV1` contract.
3. Deploy `MaliciousVestingFactory` that wraps the sale contract.
4. Configure the sale using `setTestConfig()`.
5. Simulate attacker investment.
6. Call `claimAskTokenAllocation()` — triggers reentrancy during `_createVesting()`.

---

## 🔍 Vulnerable Code Snippet

```solidity
address payable vestingAddress = _createVesting(
    msg.sender,
    uint64(vestingConfig.vestingStartTime),
    uint64(vestingConfig.vestingDurationSeconds),
    uint64(vestingConfig.vestingCliffDurationSeconds)
);

SafeTransferLib.safeTransfer(saleStatus.askToken, vestingAddress, amountToBeVested);
````

🧨 **Issue**: `_createVesting()` makes an external call **before** updating key state (`position.hasSettled = true;`), breaking the Checks-Effects-Interactions pattern.

---

## 📁 Project Structure

```
contracts/
  ├── LegionPreLiquidSaleV1.sol        # Vulnerable contract
  ├── MaliciousVestingFactory.sol      # Reentrancy vector
  └── MockERC20.sol                    # Mock token for simulation

test/
  └── ReentrancyPoC.test.js            # The PoC test script
```

---

## ⚙️ Tech Stack

* Solidity ^0.8.x
* Hardhat
* Mocha + Chai (for test assertions)
* OpenZeppelin (SafeERC20, Ownable)

---

## 💡 Suggested Fix

Move state updates *before* the external call:

```solidity
position.hasSettled = true;
usedSignatures[signature] = true;

address payable vestingAddress = _createVesting(...);
```

Follow the **Checks-Effects-Interactions** pattern strictly to avoid reentrancy.

---

## 🧪 How to Run

Install dependencies:

```bash
npm install
```

Compile and test:

```bash
npx hardhat compile
npx hardhat test test/ReentrancyPoC.test.js
```

Expected output:

```
PoC: Reentrancy in claimAskTokenAllocation
  ✔ should trigger reentrancy via malicious vesting factory
```

---

## ⚠️ Disclaimer

This project is for **educational and audit research purposes only**. Do not deploy or use maliciously.

---

## 📜 License

MIT

---

```

---

Would you like this as a downloadable `.md` file or want help committing it to the repo?
```




