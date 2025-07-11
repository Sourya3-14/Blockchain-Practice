// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
contract SafeMathTester{
    uint8 public big = 255;

    function add() public{
        unchecked{big +=1;}
    }
}