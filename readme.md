

---

````markdown
 🧬 LegionPreLiquidSaleV1 – Reentrancy Vulnerability PoC

A critical reentrancy vulnerability uncovered in the `LegionPreLiquidSaleV1` smart contract — this repository demonstrates how a malicious vesting factory can exploit improperly ordered state changes to bypass intended logic.

---

 🚨 Vulnerability Summary

The `claimAskTokenAllocation` function makes an external call to `_createVesting()` **before** updating key state variables like `position.hasSettled`.  
This allows a malicious contract to reenter the function and manipulate the flow — a classic violation of the **Checks-Effects-Interactions** pattern.

---

 🧪 Proof-of-Concept Overview

The exploit is demonstrated via a targeted unit test that simulates:

- Investor funding the contract  
- Vesting setup being triggered  
- Reentrancy occurring during `_createVesting()` before state update

---

 🔁 Exploit Steps

1. Deploy a mock ERC20 token  
2. Deploy `LegionPreLiquidSaleV1`  
3. Deploy `MaliciousVestingFactory`, passing the sale contract’s address  
4. Configure the sale using `setTestConfig()`  
5. Simulate an attacker’s investment  
6. Trigger `claimAskTokenAllocation()` → which reenters during `_createVesting()`

---

 🔍 Vulnerable Code

```solidity
address payable vestingAddress = _createVesting(
    msg.sender,
    uint64(vestingConfig.vestingStartTime),
    uint64(vestingConfig.vestingDurationSeconds),
    uint64(vestingConfig.vestingCliffDurationSeconds)
);

SafeTransferLib.safeTransfer(saleStatus.askToken, vestingAddress, amountToBeVested);
````

⚠️ This executes an external call before any protective state changes.

---

## 🧠 Root Cause

The logic fails to **update internal state** before making an external call.
Specifically: `position.hasSettled` and `usedSignatures[...]` should be updated **before** `_createVesting()` is called.

---

## 💡 Recommended Fix

Move state changes above external call:

```solidity
position.hasSettled = true;
usedSignatures[signature] = true;

address payable vestingAddress = _createVesting(...);
```

---

## 📁 Project Structure

```
contracts/
├── LegionPreLiquidSaleV1.sol        # Vulnerable contract
├── MaliciousVestingFactory.sol      # Reentrancy attack vector
└── MockERC20.sol                    # Token for simulating investor funds

test/
└── ReentrancyPoC.test.js            # Full PoC test
```

---

## 🛠 Run It Locally

1. Install dependencies:

```bash
npm install
```

2. Compile contracts:

```bash
npx hardhat compile
```

3. Run PoC test:

```bash
npx hardhat test test/ReentrancyPoC.test.js
```

✅ Output should confirm the reentrancy scenario was triggered.

---

## ⚙️ Tools Used

* Solidity ^0.8.x
* Hardhat
* Mocha + Chai
* OpenZeppelin Contracts

---

## 📚 Learnings

* Always follow **Checks-Effects-Interactions**
* Be cautious when integrating external factories or contracts
* Use automated testing to simulate real-world attacker behavior

---

## ⚠️ Disclaimer

This code is strictly for **educational and audit research purposes**.
Do **not** deploy or use maliciously in any production system.

```

---

This code is strictly based on educational and audit research purpose
```




