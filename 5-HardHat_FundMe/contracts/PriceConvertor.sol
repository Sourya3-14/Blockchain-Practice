// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceConvertor{
    function getPrice(AggregatorV3Interface priceFeed) public view returns (uint256) {
        // prettier-ignore
        (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        // price of ETH in terms of USD
        // 1e18 = 1 Eth = 10^9 gwei = 10^18 wei
        //rturns usd in 8 decimal extra format like 200000000000 means = 2000.00000000
        //working with 18 decimal places is preferred so multiply with 10^10
        return uint256(answer*1e10);//returns price in wei
    }
    function getVersion(AggregatorV3Interface priceFeed) public view returns(uint256){
        return priceFeed.version();
    }

    function getConversion(uint256 ethAmount,AggregatorV3Interface priceFeed) public view returns (uint256){
        //1 eth = 2000 usd
        //1 gwei = 2 usd
        //1 wei = 0.000000000002 usd
        //1 eth = 2000 * 10^18 wei
        //1 wei = 2000 * 10^18 / 10^18 = 2000 usd
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18; //convert to USD
        return ethAmountInUsd;
    }
}