// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// import {PriceConvertor} from "./PriceConvertor.sol";

error notOwner();

contract FundMe{
    // using PriceConvertor for uint256;
    uint256 public constant MINIMUM_USD = 1e18;
    address[] public funders;
    mapping (address => uint256) public amount;
    address public immutable i_owner;

    constructor(){
        i_owner = msg.sender;
    }

    function fund() public payable{
        require(getConversion(msg.value) >MINIMUM_USD,"No minimum amount sent");
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
     function getPrice() public view returns (uint256) {
        // prettier-ignore
        (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = AggregatorV3Interface(0xfEefF7c3fB57d18C5C6Cdd71e45D2D0b4F9377bF).latestRoundData();
       
        return uint256(answer*1e10);//returns price in wei
    }
    function getVersion() public view returns(uint256){
        return AggregatorV3Interface(0xfEefF7c3fB57d18C5C6Cdd71e45D2D0b4F9377bF).version();
    }

    function getConversion(uint256 ethAmount) public view returns(uint256){
        uint256 ethPrice = getPrice();
        uint256 ethAmountUSD = ethPrice * ethAmount/1e18;
        return ethAmountUSD;
    }
}
