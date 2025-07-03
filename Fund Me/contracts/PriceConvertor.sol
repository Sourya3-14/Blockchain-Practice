// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceConvertor{
    function getPrice() public view returns (uint256) {
        // prettier-ignore
        (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306).latestRoundData();
        // price of ETH in terms of USD
        // 1e18 = 1 Eth = 10^9 gwei = 10^18 wei
        //rturns usd in 8 decimal extra format like 200000000000 means = 2000.00000000
        //working with 18 decimal places is preferred so multiply with 10^10
        return uint256(answer*1e10);//returns price in wei
    }
    function getVersion() public view returns(uint256){
        return AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306).version();
    }

    function getConversion(uint256 ethAmount) public view returns(uint256){
        uint256 ethPrice = getPrice();
        uint256 ethAmountUSD = ethPrice * ethAmount/1e18;
        return ethAmountUSD;
    }
}