// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

import {PriceConvertor} from "./PriceConvertor.sol";
// import "hardhat/console.sol";

error FundMe__notOwner();

//NatSpec
/**
 * @title a contract for crowd funding
 * @author Sourya Adhikary
 * @notice this contract is to demo a sample funding contract
 * @dev this implements price feeds as our library
 */
contract FundMe {
    //Type declarations
    using PriceConvertor for uint256;
    //State variables
    uint256 public constant MINIMUM_USD = 5e17;
    address[] private s_funders;
    mapping(address => uint256) private s_amount;
    address private immutable i_owner;

    AggregatorV3Interface private s_priceFeed;

    //Modifiers
    modifier onlyOwner() {
        // require(msg.sender == i_owner, "Not the owner to withdraw!");
        // console.log("msg.sender: %s", msg.sender);
        // console.log("i_owner: %s", i_owner);
        if (msg.sender != i_owner) revert FundMe__notOwner(); //this is more gas efficient as the compiler knows we are checking against this variable no need for any string variables.
        _; //add whatever else present in the function
    }

    //Functions
    //constructor
    //recieve function
    //fallback function
    //external function
    //public function
    //internal function
    //private function
    //view function
    //pure function
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
     * @notice this function funds the contract
     * @dev this implements price feeds as our library
     */
    function fund() public payable {
        require(
            msg.value.getConversion(s_priceFeed) >= MINIMUM_USD,
            "No minimum amount sent"
        );
        //msg.value gets passed to as the first argument of getConversion()
        s_funders.push(msg.sender);
        s_amount[msg.sender] += msg.value;
    }

    function withdraw() public payable onlyOwner {
        //for loop
        //[1,2,3,4]
        for (uint256 i = 0; i < s_funders.length; i++) {
            address funder = s_funders[i];
            s_amount[funder] = 0;
        }
        s_funders = new address[](0);

        //transer 2300 gas gives error
        // payable(msg.sender).transfer(address(this).balance);
        //send 2300 gas returns bool
        // require(payable(msg.sender).send(address(this).balance),"Send Failed");
        //call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call Failed");
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory fundersCopy = s_funders; //copy the array to save gas
        //mapping can't be reset so we need to loop through the fundersCopy array
        for (uint256 i = 0; i < fundersCopy.length; i++) {
            address funder = fundersCopy[i];
            s_amount[funder] = 0;
        }
        s_funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call Failed");
    }

    function getDebugConversion(uint256 amount) public view returns (uint256) {
        return amount.getConversion(s_priceFeed);
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getFunderAmount(address funder) public view returns (uint256) {
        return s_amount[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
