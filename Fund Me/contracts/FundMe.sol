// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

import {PriceConvertor} from "./PriceConvertor.sol";

error notOwner();

contract FundMe{
    using PriceConvertor for uint256;
    uint256 public constant MINIMUM_USD = 1e18;
    address[] public funders;
    mapping (address => uint256) public amount;
    address public immutable i_owner;

    constructor(){
        i_owner = msg.sender;
    }

    function fund() public payable{
        require(msg.value.getConversion() >MINIMUM_USD,"No minimum amount sent");
        //msg.value gets passed to as the first argument of getConversion() 
        funders.push(msg.sender);
        amount[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner{
        //for loop
        //[1,2,3,4]
        for(uint256 i=0;i<funders.length;i++){
            address funder = funders[i];
            amount[funder] = 0;
        }
        funders = new address[](0);

        //transer 2300 gas gives error
        // payable(msg.sender).transfer(address(this).balance);
        //send 2300 gas returns bool
        // require(payable(msg.sender).send(address(this).balance),"Send Failed");
        //call
        (bool callSuccess,)=payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess,"Call Failed");
    }   
    modifier onlyOwner(){
        // require(msg.sender == i_owner, "Not the owner to withdraw!");
        if(msg.sender == i_owner)
            revert notOwner();//this is more gas efficient as the compiler knows we are checking against this variable no need for any string variables.
        _;//add whatever else present in the function
    }
    receive() external payable { 
        fund();
    }
    fallback() external payable { 
        fund();
    }
}
