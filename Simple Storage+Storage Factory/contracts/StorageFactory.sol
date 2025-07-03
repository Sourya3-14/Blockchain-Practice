// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {SimpleStorage} from "./SimpleStorage.sol";

contract StorageFactory {
    SimpleStorage[] public listsimpleStorage;
    // address[] public listSimpleStorageAddresses;

    function createSimpleStorageContract() public{
        SimpleStorage _newSimpleStorage = new SimpleStorage();
        listsimpleStorage.push(_newSimpleStorage);
    }
    function sfStore(uint256 _simpleStorageIndex,uint256 _newSimpleStorageNumber)public{
        // SimpleStorage _mySimpleStorage = SimpleStorage(listSimpleStorageAddresses[_simpleStorageIndex]);
        //ABI
        SimpleStorage _simpleStorage = listsimpleStorage[_simpleStorageIndex];
        _simpleStorage.store(_newSimpleStorageNumber);
    }
    function sfGet(uint256 _simpleStorageIndex)public view returns(uint256){
        SimpleStorage _simpleStorage = listsimpleStorage[_simpleStorageIndex];
        
        return(_simpleStorage.retrieve());
    }
}