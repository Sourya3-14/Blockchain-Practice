// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

import {PriceConvertor} from "./PriceConvertor.sol";

contract FundMe{
using PriceConvertor for uint256;

    uint256 minimumUSD = 5;
    address[] public funders;
    mapping (address => uint256) public amount;

    function fund() public payable{
        require(msg.value.getConversion() >minimumUSD,"No minimum amount sent");
        //msg.value gets passed to as the first argument of getConversion() 
        funders.push(msg.sender);
        amount[msg.sender] += msg.value;
        
    }
    function withdraw() public{
        //for loop
        //[1,2,3,4]
        for(uint256 i=0;i<funders.length;i++){
            address funder = funders[i];
            amount[funder] = 0;
        }
    }   
}
