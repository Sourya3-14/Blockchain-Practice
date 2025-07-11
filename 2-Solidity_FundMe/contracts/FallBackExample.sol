// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract FallBackExample{
    uint256 public result;

    receive() external payable { 
        result = 1;
    }
    fallback() external payable {
        result= 0;
    }
}

//explainer from : https://solidity-by-example.org/fallback/
// ether is sent to contract
//       is msg.data empty?
//           /    \
//          yes   no
//         /        \
//    recieve()?   fallback()?
//       /   \
//      yes   no
//     /       \
// receive()   fallback()