// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {SimpleStorage} from "./SimpleStorage.sol";

contract AddFiveStorage is SimpleStorage{
    function sayHello() public pure returns(string memory){
        return "hello";
    }
    function store(uint256 _favoriteNumber) public override {
        myFavoriteNumber = _favoriteNumber+5;
    }
    
}